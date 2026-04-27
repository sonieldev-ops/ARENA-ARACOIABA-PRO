import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { UserRole, UserStatus } from '../../../src/types/auth';
import { orchestrateAdminNotification } from '../notifications/notification-orchestrator';
import { NotificationType } from '../../../src/modules/notifications/types/notification.types';

/**
 * Interface para o resultado de cada item processado no lote
 */
interface BulkItemResult {
  targetUserId: string;
  fullName: string;
  success: boolean;
  message: string;
  nextRole?: UserRole;
  nextStatus?: UserStatus;
}

/**
 * Interface para o resultado final da operação em lote
 */
interface BulkOperationResult {
  action: 'APPROVE' | 'REJECT' | 'CHANGE_ACCESS';
  totalRequested: number;
  totalSucceeded: number;
  totalFailed: number;
  items: BulkItemResult[];
  correlationId: string;
}

const MAX_BATCH_SIZE = 50;

/**
 * Função auxiliar para validar permissão de SUPER_ADMIN ou ORGANIZER
 */
async function validateAdminPermission(request: functions.https.CallableRequest) {
  if (!request.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Usuário não autenticado.');
  }

  const callerUid = request.auth.uid;
  const callerDoc = await admin.firestore().collection('usuarios').doc(callerUid).get();
  const callerData = callerDoc.data();

  if (!callerData || (callerData.role !== UserRole.SUPER_ADMIN && callerData.role !== UserRole.ORGANIZER)) {
    throw new functions.https.HttpsError('permission-denied', 'Permissão insuficiente para ações em lote.');
  }

  return { callerUid, callerRole: callerData.role as UserRole };
}

/**
 * Função Genérica para Registrar Auditoria
 */
async function logAudit(
  batch: admin.firestore.WriteBatch,
  actorId: string,
  targetId: string,
  action: string,
  before: any,
  after: any,
  reason: string,
  correlationId: string
) {
  const auditRef = admin.firestore().collection('logs_auditoria').doc();
  batch.set(auditRef, {
    actorUserId: actorId,
    targetUserId: targetId,
    action,
    before,
    after,
    reason,
    source: 'BULK_ACTION',
    correlationId,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
}

/**
 * APROVAÇÃO EM LOTE
 */
export const bulkApproveUsers = functions.https.onCall(async (request: functions.https.CallableRequest<{ targetUserIds: string[] }>) => {
  const { callerUid, callerRole } = await validateAdminPermission(request);
  const { targetUserIds } = request.data;

  if (!Array.isArray(targetUserIds) || targetUserIds.length > MAX_BATCH_SIZE) {
    throw new functions.https.HttpsError('invalid-argument', `Máximo de ${MAX_BATCH_SIZE} usuários por lote.`);
  }

  const correlationId = `bulk-approve-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const results: BulkItemResult[] = [];

  for (const uid of targetUserIds) {
    const userRef = admin.firestore().collection('usuarios').doc(uid);
    const batch = admin.firestore().batch();

    try {
      const userDoc = await userRef.get();
      if (!userDoc.exists) throw new Error('Usuário não encontrado');

      const userData = userDoc.data()!;
      const requestedRole = userData.requestedRole || UserRole.PUBLIC_USER;

      // Validação de Privilege Escalation
      if (callerRole === UserRole.ORGANIZER && requestedRole === UserRole.SUPER_ADMIN) {
        throw new Error('Organizadores não podem aprovar Super Admins');
      }

      const before = { status: userData.status, isApproved: userData.isApproved, role: userData.role, accessVersion: userData.accessVersion };
      const nextVersion = (userData.accessVersion || 0) + 1;
      const after = {
        status: UserStatus.ACTIVE,
        isApproved: true,
        role: requestedRole,
        accessVersion: nextVersion
      };

      batch.update(userRef, {
        ...after,
        lastApprovalAt: admin.firestore.FieldValue.serverTimestamp(),
        lastApprovalBy: callerUid,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        requestedRole: admin.firestore.FieldValue.delete()
      });

      await logAudit(batch, callerUid, uid, 'APPROVE_USER', before, after, 'Aprovação em lote', correlationId);

      // Sincronizar Custom Claims com Access Version
      await admin.auth().setCustomUserClaims(uid, {
        role: after.role,
        status: after.status,
        isApproved: true,
        accessVersion: nextVersion
      });

      await batch.commit();

      // Disparar Notificação Assíncrona (Fire and forget no contexto da function principal)
      orchestrateAdminNotification(uid, NotificationType.USER_APPROVED, {
        actorUserId: callerUid,
        targetUserId: uid,
        sourceAction: 'BULK_APPROVE',
        correlationId,
        nextRole: after.role,
        nextStatus: after.status
      }).catch(err => console.error('Erro ao orquestrar notificação de aprovação:', err));

      results.push({ targetUserId: uid, fullName: userData.fullName, success: true, message: 'Aprovado com sucesso', nextRole: after.role });
    } catch (error: any) {
      results.push({ targetUserId: uid, fullName: 'N/A', success: false, message: error.message });
    }
  }

  return {
    action: 'APPROVE',
    totalRequested: targetUserIds.length,
    totalSucceeded: results.filter(r => r.success).length,
    totalFailed: results.filter(r => !r.success).length,
    items: results,
    correlationId
  } as BulkOperationResult;
});

/**
 * REJEIÇÃO EM LOTE
 */
export const bulkRejectUsers = functions.https.onCall(async (request: functions.https.CallableRequest<{ targetUserIds: string[], reason: string }>) => {
  const { callerUid } = await validateAdminPermission(request);
  const { targetUserIds, reason } = request.data;

  const correlationId = `bulk-reject-${Date.now()}`;
  const results: BulkItemResult[] = [];

  for (const uid of targetUserIds) {
    const userRef = admin.firestore().collection('usuarios').doc(uid);
    const batch = admin.firestore().batch();

    try {
      const userDoc = await userRef.get();
      if (!userDoc.exists) throw new Error('Usuário não encontrado');

      const userData = userDoc.data()!;
      const before = { status: userData.status, accessVersion: userData.accessVersion };
      const nextVersion = (userData.accessVersion || 0) + 1;
      const after = { status: UserStatus.REJECTED, isApproved: false, accessVersion: nextVersion };

      batch.update(userRef, {
        ...after,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      await logAudit(batch, callerUid, uid, 'REJECT_USER', before, after, reason, correlationId);

      await admin.auth().setCustomUserClaims(uid, {
        role: userData.role,
        status: after.status,
        isApproved: false,
        accessVersion: nextVersion
      });

      await batch.commit();

      orchestrateAdminNotification(uid, NotificationType.USER_REJECTED, {
        actorUserId: callerUid,
        targetUserId: uid,
        sourceAction: 'BULK_REJECT',
        correlationId,
        reason
      }).catch(err => console.error('Erro ao orquestrar notificação de rejeição:', err));

      results.push({ targetUserId: uid, fullName: userData.fullName, success: true, message: 'Rejeitado com sucesso' });
    } catch (error: any) {
      results.push({ targetUserId: uid, fullName: 'N/A', success: false, message: error.message });
    }
  }

  return {
    action: 'REJECT',
    totalRequested: targetUserIds.length,
    totalSucceeded: results.filter(r => r.success).length,
    totalFailed: results.filter(r => !r.success).length,
    items: results,
    correlationId
  };
});

/**
 * ALTERAÇÃO DE ACESSO EM LOTE
 */
export const bulkChangeUserAccess = functions.https.onCall(async (request: functions.https.CallableRequest<{
  targetUserIds: string[],
  nextRole?: UserRole,
  nextStatus?: UserStatus,
  reason: string,
  revokeSessions?: boolean
}>) => {
  const { callerUid, callerRole } = await validateAdminPermission(request);
  const { targetUserIds, nextRole, nextStatus, reason, revokeSessions } = request.data;

  const correlationId = `bulk-change-${Date.now()}`;
  const results: BulkItemResult[] = [];

  for (const uid of targetUserIds) {
    const userRef = admin.firestore().collection('usuarios').doc(uid);
    const batch = admin.firestore().batch();

    try {
      const userDoc = await userRef.get();
      if (!userDoc.exists) throw new Error('Usuário não encontrado');

      const userData = userDoc.data()!;

      // Proteção de escalação
      if (nextRole === UserRole.SUPER_ADMIN && callerRole !== UserRole.SUPER_ADMIN) {
        throw new Error('Apenas Super Admins podem promover outros a Super Admin');
      }

      const nextVersion = (userData.accessVersion || 0) + 1;
      const updates: any = {
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        accessVersion: nextVersion,
      };

      if (nextRole) {
        updates.role = nextRole;
        updates.lastRoleChangeAt = admin.firestore.FieldValue.serverTimestamp();
        updates.lastRoleChangeBy = callerUid;
      }
      if (nextStatus) {
        updates.status = nextStatus;
        if (nextStatus === UserStatus.ACTIVE) updates.isApproved = true;
      }

      batch.update(userRef, updates);

      await logAudit(batch, callerUid, uid, 'CHANGE_ACCESS', userData, updates, reason, correlationId);

      await admin.auth().setCustomUserClaims(uid, {
        role: nextRole || userData.role,
        status: nextStatus || userData.status,
        isApproved: (nextStatus === UserStatus.ACTIVE) ? true : userData.isApproved,
        accessVersion: nextVersion
      });

      if (revokeSessions) {
        await admin.auth().revokeRefreshTokens(uid);
      }

      await batch.commit();

      const notifType = nextStatus === UserStatus.SUSPENDED ? NotificationType.USER_SUSPENDED :
                        nextStatus === UserStatus.BLOCKED ? NotificationType.USER_BLOCKED :
                        nextStatus === UserStatus.ACTIVE && userData.status !== UserStatus.ACTIVE ? NotificationType.USER_REACTIVATED :
                        nextRole && nextRole !== userData.role ? NotificationType.USER_ROLE_CHANGED :
                        NotificationType.USER_STATUS_CHANGED;

      orchestrateAdminNotification(uid, notifType, {
        actorUserId: callerUid,
        targetUserId: uid,
        sourceAction: 'BULK_CHANGE_ACCESS',
        correlationId,
        previousRole: userData.role,
        nextRole,
        previousStatus: userData.status,
        nextStatus,
        reason
      }).catch(err => console.error('Erro ao orquestrar notificação de mudança de acesso:', err));

      results.push({
        targetUserId: uid,
        fullName: userData.fullName,
        success: true,
        message: 'Atualizado com sucesso',
        nextRole,
        nextStatus
      });
    } catch (error: any) {
      results.push({ targetUserId: uid, fullName: 'N/A', success: false, message: error.message });
    }
  }

  return {
    action: 'CHANGE_ACCESS',
    totalRequested: targetUserIds.length,
    totalSucceeded: results.filter(r => r.success).length,
    totalFailed: results.filter(r => !r.success).length,
    items: results,
    correlationId
  };
});
