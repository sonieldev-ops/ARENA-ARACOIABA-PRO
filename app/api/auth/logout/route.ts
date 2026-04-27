import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase/admin';
import { SESSION_COOKIE_NAME, verifySessionCookieValue } from '@/lib/auth/session';

export async function POST(req: NextRequest) {
  const sessionCookie = req.cookies.get(SESSION_COOKIE_NAME)?.value;

  const res = NextResponse.json({ ok: true }, { status: 200 });

  res.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: new Date(0),
  });

  if (!sessionCookie) return res;

  try {
    const decoded = await verifySessionCookieValue(sessionCookie);
    await adminAuth.revokeRefreshTokens(decoded.sub);
  } catch (error) {
    // Mantém logout idempotente
    console.error('Logout error:', error);
  }

  return res;
}
