import { NextRequest, NextResponse } from 'next/server';
import { getAllowedRolesForPath, hasRequiredRole, isPublicRoute } from '@/lib/auth/permissions';
import { UserRole } from '@/src/types/auth';
import { adminAuth } from '@/lib/firebase/admin';

const SESSION_COOKIE_NAME = '__session';

export async function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // Ignorar arquivos estáticos e rotas internas
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname === '/favicon.ico' ||
    /\.[a-zA-Z0-9]+$/.test(pathname)
  ) {
    return NextResponse.next();
  }

  // Se for rota pública, permite acesso
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // Verifica se a rota exige permissão
  const allowedRoles = getAllowedRolesForPath(pathname);
  if (!allowedRoles) {
    return NextResponse.next();
  }

  const sessionCookie = req.cookies.get(SESSION_COOKIE_NAME)?.value;

  // Se não houver sessão, redireciona para login com a rota de retorno
  if (!sessionCookie) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('next', `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  try {
    // Verifica o session cookie (forçando verificação de revogação para queda rápida)
    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
    const role = (decoded.role as UserRole) || UserRole.PUBLIC_USER;
    const status = (decoded.status as string) || 'PENDING_APPROVAL';

    // Se o usuário estiver bloqueado ou suspenso, não permite navegar em áreas protegidas
    if (status === 'BLOCKED' || status === 'DEACTIVATED') {
       throw new Error('Usuário bloqueado');
    }

    // Se pendente de aprovação, só pode acessar rotas permitidas para pendentes
    if (status === 'PENDING_APPROVAL' && !pathname.startsWith('/pending-approval')) {
       return NextResponse.redirect(new URL('/pending-approval', req.url));
    }

    return NextResponse.next();
  } catch (error) {
    console.error('Proxy session verification error:', error);

    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('next', `${pathname}${search}`);
    const res = NextResponse.redirect(loginUrl);

    // Limpa o cookie inválido
    res.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: '',
      path: '/',
      expires: new Date(0),
    });

    return res;
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
