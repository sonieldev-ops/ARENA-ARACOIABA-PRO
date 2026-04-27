import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const session = request.cookies.get('__session')?.value;
  const { pathname } = request.nextUrl;

  // 1. Definir rotas públicas e privadas
  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register');
  const isAdminPage = pathname.startsWith('/admin');
  const isPendingPage = pathname === '/pending-approval';

  // 2. Se não houver sessão e tentar acessar admin, vai para login
  if (!session && isAdminPage) {
    const url = new URL('/login', request.url);
    url.searchParams.set('from', pathname);
    return NextResponse.redirect(url);
  }

  // 3. Se houver sessão e tentar acessar login/register, vai para dashboard
  if (session && isAuthPage) {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url));
  }

  // 4. Verificação de Status (Otimizada via API Me)
  // Nota: Em produção, o middleware pode verificar o payload do JWT se o __session for o ID Token,
  // mas aqui confiamos na API /me que já valida o status.

  return NextResponse.next();
}

// Configuração do matcher para otimização
export const config = {
  matcher: [
    '/admin/:path*',
    '/login',
    '/register',
    '/pending-approval',
  ],
};
