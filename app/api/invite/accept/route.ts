import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/src/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(req: NextRequest) {
  try {
    const { inviteId, userId } = await req.json();

    if (!inviteId || !userId) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const inviteRef = adminDb.collection('teamInvites').doc(inviteId);
    const inviteSnap = await inviteRef.get();

    if (!inviteSnap.exists) {
      return NextResponse.json({ error: 'Invite not found' }, { status: 404 });
    }

    const inviteData = inviteSnap.data();

    if (inviteData?.status !== 'PENDING') {
      return NextResponse.json({ error: 'Invite is no longer pending' }, { status: 400 });
    }

    // Executar Transação
    await adminDb.runTransaction(async (transaction) => {
      const userRef = adminDb.collection('users').doc(userId);
      const userSnap = await transaction.get(userRef);

      if (!userSnap.exists) throw new Error('User not found');
      const userData = userSnap.data();

      // 1. Atualizar Convite
      transaction.update(inviteRef, {
        status: 'ACCEPTED',
        acceptedAt: FieldValue.serverTimestamp()
      });

      // 2. Adicionar ao Elenco do Time
      const memberRef = adminDb.collection('teams').doc(inviteData!.teamId).collection('members').doc(userId);
      transaction.set(memberRef, {
        userId,
        userName: userData?.fullName || 'Atleta',
        userEmail: userData?.email,
        role: inviteData!.role,
        status: 'ACTIVE',
        joinedAt: FieldValue.serverTimestamp()
      });

      // 3. Atualizar Perfil do Usuário
      transaction.update(userRef, {
        teamId: inviteData!.teamId,
        teamName: inviteData!.teamName,
        updatedAt: FieldValue.serverTimestamp()
      });

      // 4. Log de Auditoria
      const auditRef = adminDb.collection('adminAuditLogs').doc();
      transaction.set(auditRef, {
        action: 'INVITE_ACCEPTED',
        operatorName: userData?.fullName,
        operatorUid: userId,
        targetName: inviteData!.teamName,
        targetUid: inviteData!.teamId,
        timestamp: FieldValue.serverTimestamp(),
        severity: 'INFO',
        details: `Usuário aceitou convite para entrar no time ${inviteData!.teamName}`
      });
    });

    return NextResponse.json({ success: true, message: 'Convite aceito com sucesso!' });

  } catch (error: any) {
    console.error('Invite Accept Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
