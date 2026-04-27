import { cookies } from 'next/headers';
import { adminAuth } from '@/lib/firebase/admin';
import { UserRole, UserStatus, UserSession } from '@/src/types/auth';

export const SESSION_COOKIE_NAME = '__session';
export const SESSION_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 5; // 5 dias

export async function createSessionCookieFromIdToken(idToken: string) {
  return adminAuth.createSessionCookie(idToken, { expiresIn: SESSION_MAX_AGE_MS });
}

export async function verifySessionCookieValue(sessionCookie: string) {
  return adminAuth.verifySessionCookie(sessionCookie, true);
}

export async function getSessionUser(): Promise<UserSession | null> {
  const store = await cookies();
  const sessionCookie = store.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionCookie || !adminAuth) return null;

  try {
    // Verificamos a revogação para garantir que sessões banidas caiam rapidamente
    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);

    return {
      id: decoded.uid,
      email: decoded.email || '',
      name: (decoded.name as string) || '',
      role: (decoded.role as UserRole) || UserRole.PUBLIC_USER,
      status: (decoded.status as UserStatus) || UserStatus.PENDING_APPROVAL,
      isApproved: (decoded.isApproved as boolean) || false,
      accessVersion: (decoded.accessVersion as number) || 0,
    };
  } catch (error) {
    console.error('getSessionUser error:', error);
    return null;
  }
}
