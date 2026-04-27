import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase/admin';
import {
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_MS,
  createSessionCookieFromIdToken,
} from '@/lib/auth/session';

/**
 * Route Handler para Revalidação de Sessão
 * Recebe um novo ID Token (gerado via client com forceRefresh: true)
 * e atualiza o cookie de sessão com as novas claims.
 */
export async function POST(req: NextRequest) {
  try {
    const { idToken } = await req.json();

    if (!idToken) {
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 400 });
    }

    // 1. Verifica o ID Token e força verificação de revogação
    const decoded = await adminAuth.verifyIdToken(idToken, true);

    // 2. Cria o novo Session Cookie
    const sessionCookie = await createSessionCookieFromIdToken(idToken);

    const res = NextResponse.json({
      success: true,
      user: {
        uid: decoded.uid,
        role: decoded.role,
        status: decoded.status,
        accessVersion: decoded.accessVersion
      }
    });

    // 3. Define o cookie de sessão atualizado
    res.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: sessionCookie,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: SESSION_MAX_AGE_MS / 1000,
    });

    return res;
  } catch (error: any) {
    console.error('Erro no refresh-session:', error);

    // Se o token foi revogado ou é inválido, limpamos o cookie
    const response = NextResponse.json(
      { error: 'Sessão inválida ou revogada' },
      { status: 401 }
    );

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: '',
      maxAge: 0,
      path: '/'
    });

    return response;
  }
}
