import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';
import { UserRole, UserStatus, UserProfile } from '@/src/types/auth';

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
  await adminDb.collection('adminAuditLogs').add({
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
  });
}

/**
 * Aprova um usuário pendente.
 */
export async function approveUser(actorId: string, targetUserId: string) {
  const userRef = adminDb.collection('users').doc(targetUserId);

  return await adminDb.runTransaction(async (transaction) => {
    const snap = await transaction.get(userRef);
    if (!snap.exists) throw new Error('Usuário não encontrado');

    const before = snap.data() as UserProfile;
    const requestedRole = (before as any).metadata?.requestedRole || UserRole.PUBLIC_USER;

    const now = FieldValue.serverTimestamp();
    const update = {
      role: requestedRole,
      status: UserStatus.ACTIVE,
      isApproved: true,
      approvalRequired: false,
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
 * Rejeita um usuário pendente.
 */
export async function rejectUser(actorId: string, targetUserId: string, reason: string) {
  const userRef = adminDb.collection('users').doc(targetUserId);

  return await adminDb.runTransaction(async (transaction) => {
    const snap = await transaction.get(userRef);
    if (!snap.exists) throw new Error('Usuário não encontrado');

    const before = snap.data() as UserProfile;
    const now = FieldValue.serverTimestamp();

    const update = {
      status: UserStatus.REJECTED,
      isApproved: false,
      approvalRequired: false,
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
  const userRef = adminDb.collection('users').doc(targetUserId);

  return await adminDb.runTransaction(async (transaction) => {
    const snap = await transaction.get(userRef);
    if (!snap.exists) throw new Error('Usuário não encontrado');

    const before = snap.data() as UserProfile;
    const now = FieldValue.serverTimestamp();
    const update: any = { updatedAt: now };

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
