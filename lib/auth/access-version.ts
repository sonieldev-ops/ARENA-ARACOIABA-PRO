import { adminDb, adminAuth } from '@/lib/firebase/admin';
import { UserRole, UserStatus } from '@/src/types/auth';

/**
 * Incrementa a versão de acesso do usuário e sincroniza claims.
 * Usado após mudanças críticas de role ou status.
 */
export async function bumpUserAccessVersion(uid: string, options: {
  role?: UserRole;
  status?: UserStatus;
  isApproved?: boolean;
  revokeSessions?: boolean;
}) {
  const userRef = adminDb.collection('users').doc(uid);

  return adminDb.runTransaction(async (transaction) => {
    const userDoc = await transaction.get(userRef);
    if (!userDoc.exists) throw new Error('Usuário não encontrado');

    const currentData = userDoc.data()!;
    const newVersion = (currentData.accessVersion || 0) + 1;

    const updates: any = {
      accessVersion: newVersion,
      updatedAt: new Date(),
    };

    if (options.role) updates.role = options.role;
    if (options.status) updates.status = options.status;
    if (options.isApproved !== undefined) updates.isApproved = options.isApproved;

    transaction.update(userRef, updates);

    // Sincroniza Custom Claims
    await adminAuth.setCustomUserClaims(uid, {
      role: options.role || currentData.role,
      status: options.status || currentData.status,
      isApproved: options.isApproved !== undefined ? options.isApproved : currentData.isApproved,
      accessVersion: newVersion
    });

    if (options.revokeSessions) {
      await adminAuth.revokeRefreshTokens(uid);
    }

    return { version: newVersion };
  });
}
