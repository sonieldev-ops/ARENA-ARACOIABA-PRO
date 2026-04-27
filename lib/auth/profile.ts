import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';
import { resolveInitialAccess } from './claims';
import { UserRole, UserStatus, UserProfile } from '@/src/types/auth';

export async function createInitialProfile(input: {
  uid: string;
  email: string;
  fullName: string;
  phone?: string;
  requestedRole?: UserRole;
}) {
  const { uid, email, fullName, phone, requestedRole } = input;

  const access = resolveInitialAccess(requestedRole);

  const profileRef = adminDb.collection('users').doc(uid);

  const existing = await profileRef.get();
  if (existing.exists) {
    return existing.data() as UserProfile;
  }

  const now = FieldValue.serverTimestamp();

  const profile: any = {
    uid,
    email,
    fullName,
    phone: phone ?? null,
    role: access.role,
    status: access.status,
    isApproved: access.isApproved,
    approvalRequired: access.approvalRequired,
    photoUrl: null,
    teamId: null,
    createdAt: now,
    updatedAt: now,
    createdBy: 'self-signup',
    lastRoleChangeAt: now,
    lastRoleChangeBy: 'system',
    lastApprovalAt: access.isApproved ? now : null,
    lastApprovalBy: access.isApproved ? 'system' : null,
    blockedReason: null,
    suspensionReason: null,
    metadata: {
      requestedRole: requestedRole ?? UserRole.PUBLIC_USER,
      signupSource: 'web',
    },
    preferences: {},
  };

  await profileRef.set(profile);

  // Injetar Custom Claims
  await adminAuth.setCustomUserClaims(uid, {
    role: access.role,
    status: access.status,
    isApproved: access.isApproved,
    approvalRequired: access.approvalRequired,
  });

  return profile as UserProfile;
}
