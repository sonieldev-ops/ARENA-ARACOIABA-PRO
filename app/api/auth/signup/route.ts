import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase/admin';
import {
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_MS,
  createSessionCookieFromIdToken,
} from '@/lib/auth/session';
import { createInitialProfile } from '@/lib/auth/profile';
import { UserRole } from '@/src/types/auth';

export async function POST(req: NextRequest) {
  try {
    const { idToken, fullName, phone, requestedRole } = await req.json();

    if (!idToken || !fullName?.trim()) {
      return NextResponse.json(
        { error: 'Campos obrigatórios ausentes' },
        { status: 400 }
      );
    }

    const decoded = await adminAuth.verifyIdToken(idToken, true);

    if (!decoded.email) {
      return NextResponse.json(
        { error: 'E-mail do usuário é obrigatório' },
        { status: 400 }
      );
    }

    // Cria o perfil e define claims iniciais
    const profile = await createInitialProfile({
      uid: decoded.uid,
      email: decoded.email,
      fullName: fullName.trim(),
      phone: phone?.trim(),
      requestedRole: requestedRole as UserRole,
    });

    // Busca o usuário atualizado para garantir que pegamos as novas claims
    const refreshedUser = await adminAuth.getUser(decoded.uid);

    // Cria o session cookie
    const sessionCookie = await createSessionCookieFromIdToken(idToken);

    const res = NextResponse.json(
      {
        ok: true,
        user: {
          uid: refreshedUser.uid,
          email: refreshedUser.email,
          role: (refreshedUser.customClaims?.role as string) ?? profile.role,
          status: (refreshedUser.customClaims?.status as string) ?? profile.status,
          isApproved: (refreshedUser.customClaims?.isApproved as boolean) ?? profile.isApproved,
          approvalRequired: (refreshedUser.customClaims?.approvalRequired as boolean) ?? profile.approvalRequired,
        },
      },
      { status: 200 }
    );

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
  } catch (error) {
    console.error('POST /api/auth/signup error', error);
    return NextResponse.json({ error: 'Falha no cadastro' }, { status: 401 });
  }
}
