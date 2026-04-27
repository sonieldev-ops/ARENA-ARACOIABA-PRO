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

  let destinationRoute = '';

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

    // 4. Se a rota atual for diferente da de destino, redireciona
    // Nota: O redirect deve ser chamado FORA do bloco try-catch ou tratado especificamente
    // mas aqui o mais simples é mover a lógica de decisão para fora ou checar o tipo do erro.

    // Para simplificar e evitar o erro no log:
    destinationRoute = route;
  } catch (error: any) {
    // Se for um erro de redirecionamento do próprio Next, relance-o
    if (error.digest?.includes('NEXT_REDIRECT')) throw error;

    console.error('[Dashboard Redirect Error]:', error);
    redirect('/login');
  }

  if (destinationRoute) {
    redirect(destinationRoute);
  }
}
