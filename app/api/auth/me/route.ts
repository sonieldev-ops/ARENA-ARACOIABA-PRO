import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session';
import { adminDb } from '@/lib/firebase/admin';

export async function GET() {
  const user = await getSessionUser();

  if (!user) {
    return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
  }

  // Verificação de consistência em tempo real com o Firestore para o endpoint 'me'
  // Isso garante que mudanças críticas sejam detectadas no próximo poll do cliente
  const userDoc = await adminDb.collection('usuarios').doc(user.id).get();
  const userData = userDoc.data();

  if (!userData) {
    return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
  }

  // Se houver mismatch de versão, sinalizamos para o cliente
  const forceRefresh = userData.accessVersion > user.accessVersion;

  return NextResponse.json({
    authenticated: true,
    user: {
      ...user,
      // Retornamos os dados mais frescos do Firestore
      role: userData.role,
      status: userData.status,
      isApproved: userData.isApproved,
    },
    forceRefresh,
    // Se o status for crítico, podemos forçar logout
    mustLogout: userData.status === 'BLOCKED' || userData.status === 'DEACTIVATED'
  }, { status: 200 });
}
