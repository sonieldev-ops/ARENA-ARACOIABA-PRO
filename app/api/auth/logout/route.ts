import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function POST() {
  const cookieStore = await cookies();

  // Criar a resposta de sucesso
  const response = NextResponse.json(
    { success: true, message: 'Logout realizado com sucesso' },
    { status: 200 }
  );

  // Limpar os cookies com flags de segurança
  const cookieOptions = {
    path: '/',
    maxAge: 0,
    expires: new Date(0),
    httpOnly: false, // user-status e user-role não eram httpOnly
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
  };

  response.cookies.set('__session', '', { ...cookieOptions, httpOnly: true });
  response.cookies.set('user-status', '', cookieOptions);
  response.cookies.set('user-role', '', cookieOptions);

  return response;
}

// Suporte para GET caso queira fazer logout via link (opcional, mas bom para UX)
export async function GET() {
  return POST();
}
