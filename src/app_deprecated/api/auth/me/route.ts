import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { UserProfile } from '@/types/auth';

const sanitizeData = (data: any) => {
  const sanitized = { ...data };
  for (const key in sanitized) {
    if (sanitized[key]?.toDate) {
      sanitized[key] = sanitized[key].toDate().toISOString();
    } else if (sanitized[key] && typeof sanitized[key] === 'object' && !Array.isArray(sanitized[key])) {
      sanitized[key] = sanitizeData(sanitized[key]);
    }
  }
  return sanitized;
};

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
    const userDoc = await adminDb.collection('usuarios').doc(decodedClaims.uid).get();

    if (!userDoc.exists) {
      return NextResponse.json({ user: null }, { status: 404 });
    }

    const userData = userDoc.data() as UserProfile;

    return NextResponse.json({
      user: sanitizeData({
        id: decodedClaims.uid,
        ...userData,
        email: decodedClaims.email || userData.email, // Garante o email da claim se disponível
      })
    });
  } catch (error) {
    console.error('Auth Me Error:', error);
    return NextResponse.json({ user: null }, { status: 401 });
  }
}
