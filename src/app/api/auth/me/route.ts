import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { UserProfile } from '@/types/auth';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('__session')?.value;

    if (!sessionCookie) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    // Verifica o cookie de sessão
    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);

    // Busca o perfil completo no Firestore
    const userDoc = await adminDb.collection('users').doc(decodedClaims.uid).get();

    if (!userDoc.exists) {
      return NextResponse.json({ user: null }, { status: 404 });
    }

    const userData = userDoc.data() as UserProfile;

    // Verifica o accessVersion (Invalidação de Sessão)
    // Se o accessVersion no banco for maior que o da claim (se guardado na claim)
    // ou se você quiser forçar re-login em mudanças críticas.

    return NextResponse.json({
      user: {
        id: decodedClaims.uid,
        email: decodedClaims.email,
        ...userData
      }
    });
  } catch (error) {
    console.error('Auth Me Error:', error);
    return NextResponse.json({ user: null }, { status: 401 });
  }
}
