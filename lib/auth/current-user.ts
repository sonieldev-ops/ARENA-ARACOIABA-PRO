import { redirect } from 'next/navigation';
import { getSessionUser } from './session';
import { UserRole } from '@/src/types/auth';

export async function requireAuth() {
  const user = await getSessionUser();
  if (!user) redirect('/login');
  return user;
}

export async function requireRole(roles: UserRole[]) {
  const user = await requireAuth();
  if (!roles.includes(user.role)) redirect('/unauthorized');
  return user;
}
