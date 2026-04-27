import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { adminAuth } from '@/src/lib/firebase/admin';
import { resolveDefaultRouteByAccess } from '@/src/lib/auth/access-routing';
import { UserRole, UserStatus } from '@/src/types/auth';

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('__session')?.value;

  if (!sessionCookie) {
    redirect('/login');
  }

  try {
    // 1. Verificar o cookie de sessão no servidor
    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);

    // 2. Resolver o estado de acesso com base nas claims
    const accessState = {
      role: (decodedClaims.role as UserRole) || UserRole.PUBLIC_USER,
      status: (decodedClaims.status as UserStatus) || UserStatus.PENDING_APPROVAL,
      isApproved: !!decodedClaims.isApproved,
      approvalRequired: !!decodedClaims.approvalRequired
    };

    // 3. Obter rota de destino
    const { route } = resolveDefaultRouteByAccess(accessState);

    // 4. Redirecionar para o destino correto
    redirect(route);
  } catch (error) {
    console.error('[Dashboard Redirect Error]:', error);
    redirect('/login');
  }
}
