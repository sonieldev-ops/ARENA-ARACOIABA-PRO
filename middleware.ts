import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { UserRole } from "./types/auth";
import { hasPermission, isPublicRoute } from "./lib/auth/roles";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Permitir rotas públicas
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // 2. Extrair token/sessão (Exemplo genérico - adapte para NextAuth ou JWT)
  // Normalmente você pegaria do cookie: request.cookies.get("next-auth.session-token")
  const sessionToken = request.cookies.get("session")?.value;

  if (!sessionToken) {
    // Redireciona para login se não houver sessão
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 3. Simulação de extração de role (Em produção, decodifique o JWT ou busque no Redis/DB)
  // Aqui assumimos que o role está codificado no cookie ou buscado via serviço
  const userRole = request.cookies.get("user-role")?.value as UserRole;

  if (!userRole) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 4. Verificar autorização
  if (!hasPermission(userRole, pathname)) {
    console.warn(`Acesso negado para o perfil ${userRole} na rota ${pathname}`);
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  return NextResponse.next();
}

// Configuração do Matcher: Define em quais caminhos o middleware deve rodar
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files like logos)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|public|images|icons).*)",
  ],
};
