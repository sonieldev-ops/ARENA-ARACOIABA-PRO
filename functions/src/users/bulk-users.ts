import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { UserRole, UserStatus } from '../../../src/types/auth';

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
async function validateAdminPermission(context: functions.https.CallableContext) {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Usuário não autenticado.');
  }

  const callerUid = context.auth.uid;
  const callerDoc = await admin.firestore().collection('users').doc(callerUid).get();
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
  const auditRef = admin.firestore().collection('adminAuditLogs').doc();
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
export const bulkApproveUsers = functions.https.onCall(async (data: { targetUserIds: string[] }, context) => {
  const { callerUid, callerRole } = await validateAdminPermission(context);
  const { targetUserIds } = data;

  if (!Array.isArray(targetUserIds) || targetUserIds.length > MAX_BATCH_SIZE) {
    throw new functions.https.HttpsError('invalid-argument', `Máximo de ${MAX_BATCH_SIZE} usuários por lote.`);
  }

  const correlationId = `bulk-approve-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const results: BulkItemResult[] = [];

  for (const uid of targetUserIds) {
    const userRef = admin.firestore().collection('users').doc(uid);
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

      const before = { status: userData.status, isApproved: userData.isApproved, role: userData.role };
      const after = { status: UserStatus.ACTIVE, isApproved: true, role: requestedRole };

      batch.update(userRef, {
        ...after,
        lastApprovalAt: admin.firestore.FieldValue.serverTimestamp(),
        lastApprovalBy: callerUid,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        requestedRole: admin.firestore.FieldValue.delete()
      });

      await logAudit(batch, callerUid, uid, 'APPROVE_USER', before, after, 'Aprovação em lote', correlationId);

      // Sincronizar Custom Claims
      await admin.auth().setCustomUserClaims(uid, {
        role: after.role,
        status: after.status,
        isApproved: true
      });

      await batch.commit();
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
export const bulkRejectUsers = functions.https.onCall(async (data: { targetUserIds: string[], reason: string }, context) => {
  const { callerUid } = await validateAdminPermission(context);
  const { targetUserIds, reason } = data;

  const correlationId = `bulk-reject-${Date.now()}`;
  const results: BulkItemResult[] = [];

  for (const uid of targetUserIds) {
    const userRef = admin.firestore().collection('users').doc(uid);
    const batch = admin.firestore().batch();

    try {
      const userDoc = await userRef.get();
      if (!userDoc.exists) throw new Error('Usuário não encontrado');

      const userData = userDoc.data()!;
      const before = { status: userData.status };
      const after = { status: UserStatus.REJECTED, isApproved: false };

      batch.update(userRef, {
        ...after,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      await logAudit(batch, callerUid, uid, 'REJECT_USER', before, after, reason, correlationId);

      await admin.auth().setCustomUserClaims(uid, {
        role: userData.role,
        status: after.status,
        isApproved: false
      });

      await batch.commit();
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
export const bulkChangeUserAccess = functions.https.onCall(async (data: {
  targetUserIds: string[],
  nextRole?: UserRole,
  nextStatus?: UserStatus,
  reason: string,
  revokeSessions?: boolean
}, context) => {
  const { callerUid, callerRole } = await validateAdminPermission(context);
  const { targetUserIds, nextRole, nextStatus, reason, revokeSessions } = data;

  const correlationId = `bulk-change-${Date.now()}`;
  const results: BulkItemResult[] = [];

  for (const uid of targetUserIds) {
    const userRef = admin.firestore().collection('users').doc(uid);
    const batch = admin.firestore().batch();

    try {
      const userDoc = await userRef.get();
      if (!userDoc.exists) throw new Error('Usuário não encontrado');

      const userData = userDoc.data()!;

      // Proteção de escalação
      if (nextRole === UserRole.SUPER_ADMIN && callerRole !== UserRole.SUPER_ADMIN) {
        throw new Error('Apenas Super Admins podem promover outros a Super Admin');
      }

      const updates: any = {
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
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
        isApproved: (nextStatus === UserStatus.ACTIVE) ? true : userData.isApproved
      });

      if (revokeSessions) {
        await admin.auth().revokeRefreshTokens(uid);
      }

      await batch.commit();
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
