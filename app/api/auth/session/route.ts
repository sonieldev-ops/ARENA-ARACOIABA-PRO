import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase/admin';
import {
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_MS,
  createSessionCookieFromIdToken,
} from '@/lib/auth/session';

export async function POST(req: NextRequest) {
  try {
    const { idToken } = await req.json();

    if (!idToken) {
      return NextResponse.json({ error: 'Missing idToken' }, { status: 400 });
    }

    // Verifica o ID token e força a verificação de revogação
    const decoded = await adminAuth.verifyIdToken(idToken, true);

    // Cria o session cookie
    const sessionCookie = await createSessionCookieFromIdToken(idToken);

    const res = NextResponse.json(
      {
        ok: true,
        user: {
          uid: decoded.uid,
          email: decoded.email,
          role: decoded.role || 'PUBLIC_USER',
          status: decoded.status || 'PENDING_APPROVAL',
          accessVersion: decoded.accessVersion || 0,
        },
      },
      { status: 200 }
    );

    const status = decoded.status || 'PENDING_APPROVAL';
    const role = decoded.role || 'PUBLIC_USER';

    res.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: sessionCookie,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: SESSION_MAX_AGE_MS / 1000,
    });

    // Adiciona hints de estado para o Middleware
    res.cookies.set({
      name: 'user-status',
      value: status,
      httpOnly: false, // Middleware precisa ler
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: SESSION_MAX_AGE_MS / 1000,
    });

    res.cookies.set({
      name: 'user-role',
      value: role,
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: SESSION_MAX_AGE_MS / 1000,
    });

    return res;
  } catch (error) {
    console.error('POST /api/auth/session error', error);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
