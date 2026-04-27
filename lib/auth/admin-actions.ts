import { adminAuth, adminDb } from '../firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';
import { UserRole, UserStatus, UserProfile } from '../../src/types/auth';

import { Transaction } from 'firebase-admin/firestore';

/**
 * Registra um log de auditoria administrativa.
 */
export async function recordAdminAuditLog(input: {
  actorUserId: string;
  targetUserId: string;
  action: string;
  before: any;
  after: any;
  reason?: string | null;
}) {
  await adminDb.collection('logs_auditoria').add({
    ...input,
    reason: input.reason ?? null,
    source: 'ADMIN_PANEL',
    createdAt: FieldValue.serverTimestamp(),
  });
}

/**
 * Sincroniza Custom Claims baseadas no estado atual do Firestore.
 */
export async function syncClaimsFromProfile(uid: string, profile: Partial<UserProfile>) {
  await adminAuth.setCustomUserClaims(uid, {
    role: profile.role,
    status: profile.status,
    isApproved: profile.isApproved,
    approvalRequired: profile.approvalRequired,
    accessVersion: profile.accessVersion || 0,
  });
}

/**
 * Aprova um usuário pendente.
 */
export async function approveUser(actorId: string, targetUserId: string) {
  const userRef = adminDb.collection('usuarios').doc(targetUserId);

  return await adminDb.runTransaction(async (transaction: Transaction) => {
    const snap = (await transaction.get(userRef)) as any;
    if (!snap.exists) throw new Error('Usuário não encontrado');

    const before = snap.data() as UserProfile;
    const requestedRole = before.requestedRole || UserRole.PUBLIC_USER;
    const nextVersion = (before.accessVersion || 0) + 1;

    const now = FieldValue.serverTimestamp();
    const update = {
      role: requestedRole,
      status: UserStatus.ACTIVE,
      isApproved: true,
      approvalRequired: false,
      accessVersion: nextVersion,
      lastApprovalAt: now,
      lastApprovalBy: actorId,
      lastRoleChangeAt: now,
      lastRoleChangeBy: actorId,
      updatedAt: now,
    };

    transaction.update(userRef, update);

    const after = { ...before, ...update };
    await syncClaimsFromProfile(targetUserId, after as UserProfile);
    await recordAdminAuditLog({
      actorUserId: actorId,
      targetUserId,
      action: 'USER_APPROVED',
      before,
      after,
    });

    return after;
  });
}

/**
 * Aprova múltiplos usuários em lote.
 */
export async function bulkApproveUsers(actorId: string, targetUserIds: string[]) {
  const results = [];
  const errors = [];

  // Executamos em série ou pequenos chunks para evitar limites de concorrência/transação do Firestore se necessário
  // Para volumes administrativos normais (ex: 20-50), Promise.all é aceitável.
  const promises = targetUserIds.map(async (uid) => {
    try {
      const result = await approveUser(actorId, uid);
      return { uid, success: true, role: result.role };
    } catch (error: any) {
      return { uid, success: false, error: error.message };
    }
  });

  const resolved = await Promise.all(promises);
  return {
    total: targetUserIds.length,
    approved: resolved.filter(r => r.success).length,
    failed: resolved.filter(r => !r.success).length,
    details: resolved
  };
}

/**
 * Rejeita um usuário pendente.
 */
export async function rejectUser(actorId: string, targetUserId: string, reason: string) {
  const userRef = adminDb.collection('usuarios').doc(targetUserId);

  return await adminDb.runTransaction(async (transaction: Transaction) => {
    const snap = (await transaction.get(userRef)) as any;
    if (!snap.exists) throw new Error('Usuário não encontrado');

    const before = snap.data() as UserProfile;
    const now = FieldValue.serverTimestamp();
    const nextVersion = (before.accessVersion || 0) + 1;

    const update = {
      status: UserStatus.REJECTED,
      isApproved: false,
      approvalRequired: false,
      accessVersion: nextVersion,
      updatedAt: now,
      blockedReason: reason,
    };

    transaction.update(userRef, update);

    const after = { ...before, ...update };
    await syncClaimsFromProfile(targetUserId, after as UserProfile);
    await recordAdminAuditLog({
      actorUserId: actorId,
      targetUserId,
      action: 'USER_REJECTED',
      before,
      after,
      reason,
    });

    return after;
  });
}

/**
 * Altera acesso (Role/Status) de forma genérica.
 */
export async function changeUserAccess(input: {
  actorId: string;
  targetUserId: string;
  nextRole?: UserRole;
  nextStatus?: UserStatus;
  reason?: string;
}) {
  const { actorId, targetUserId, nextRole, nextStatus, reason } = input;
  const userRef = adminDb.collection('usuarios').doc(targetUserId);

  return await adminDb.runTransaction(async (transaction: Transaction) => {
    const snap = (await transaction.get(userRef)) as any;
    if (!snap.exists) throw new Error('Usuário não encontrado');

    const before = snap.data() as UserProfile;
    const now = FieldValue.serverTimestamp();
    const nextVersion = (before.accessVersion || 0) + 1;
    const update: any = {
      updatedAt: now,
      accessVersion: nextVersion
    };

    if (nextRole && nextRole !== before.role) {
      update.role = nextRole;
      update.lastRoleChangeAt = now;
      update.lastRoleChangeBy = actorId;
    }

    if (nextStatus && nextStatus !== before.status) {
      update.status = nextStatus;
      if (nextStatus === UserStatus.ACTIVE) {
        update.isApproved = true;
        update.approvalRequired = false;
      }
    }

    if (reason) {
      update.blockedReason = reason;
    }

    transaction.update(userRef, update);

    const after = { ...before, ...update };
    await syncClaimsFromProfile(targetUserId, after as UserProfile);

    // Revoga sessões se for bloqueio ou mudança crítica de role
    if (nextStatus === UserStatus.BLOCKED || nextStatus === UserStatus.SUSPENDED || nextRole) {
      await adminAuth.revokeRefreshTokens(targetUserId);
    }

    await recordAdminAuditLog({
      actorUserId: actorId,
      targetUserId,
      action: 'USER_ACCESS_CHANGED',
      before,
      after,
      reason,
    });

    return after;
  });
}
