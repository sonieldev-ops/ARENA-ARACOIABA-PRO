import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/src/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(req: NextRequest) {
  try {
    // 1. Verificação de Autenticação
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Não autorizado. Token não fornecido.' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(token);
    } catch (e) {
      return NextResponse.json({ error: 'Token inválido ou expirado.' }, { status: 401 });
    }

    // Verificar Roles: STAFF (SUPER_ADMIN, ADMIN, ORGANIZER, REFEREE)
    const role = decodedToken.role;
    if (!['SUPER_ADMIN', 'ADMIN', 'ORGANIZER', 'REFEREE'].includes(role)) {
      return NextResponse.json({ error: 'Acesso negado. Requer privilégios administrativos.' }, { status: 403 });
    }

    const { matchId, userId, userName } = await req.json();

    if (!matchId || !userId || !userName) {
      return NextResponse.json({ error: 'Dados insuficientes' }, { status: 400 });
    }

    const matchRef = adminDb.collection('partidas').doc(matchId);
    const matchSnap = await matchRef.get();

    if (!matchSnap.exists) {
      return NextResponse.json({ error: 'Partida não encontrada' }, { status: 404 });
    }

    const matchData = matchSnap.data();

    if (matchData?.summaryLocked) {
      return NextResponse.json({ error: 'Esta súmula já está bloqueada para edições.' }, { status: 400 });
    }

    const scoreA = matchData?.scoreA || 0;
    const scoreB = matchData?.scoreB || 0;
    const finalScore = `${scoreA} x ${scoreB}`;
    const championshipId = matchData?.championshipId;

    // --- 2. Atualizar Rankings das Equipes ---
    const updateTeam = async (teamId: string, teamName: string, goalsFor: number, goalsAgainst: number) => {
      if (!teamId || !championshipId) return;

      const rankingRef = adminDb.collection('classificacoes').doc(`${championshipId}_${teamId}`);
      
      let points = 0;
      let win = 0;
      let draw = 0;
      let loss = 0;

      if (goalsFor > goalsAgainst) { points = 3; win = 1; }
      else if (goalsFor === goalsAgainst) { points = 1; draw = 1; }
      else { points = 0; loss = 1; }

      await adminDb.runTransaction(async (t: any) => {
        const doc = await t.get(rankingRef);
        if (!doc.exists) {
          t.set(rankingRef, {
            championshipId,
            teamId,
            name: teamName,
            points,
            played: 1,
            victories: win,
            draws: draw,
            losses: loss,
            goalsFor,
            goalsAgainst,
            goalDifference: goalsFor - goalsAgainst,
            updatedAt: FieldValue.serverTimestamp()
          });
        } else {
          t.update(rankingRef, {
            points: FieldValue.increment(points),
            played: FieldValue.increment(1),
            victories: FieldValue.increment(win),
            draws: FieldValue.increment(draw),
            losses: FieldValue.increment(loss),
            goalsFor: FieldValue.increment(goalsFor),
            goalsAgainst: FieldValue.increment(goalsAgainst),
            goalDifference: FieldValue.increment(goalsFor - goalsAgainst),
            updatedAt: FieldValue.serverTimestamp()
          });
        }
      });
    };

    await Promise.all([
      updateTeam(matchData?.teamAId, matchData?.teamAName, scoreA, scoreB),
      updateTeam(matchData?.teamBId, matchData?.teamBName, scoreB, scoreA)
    ]);

    // --- 3. Atualizar Gols dos Atletas ---
    const eventsSnap = await adminDb.collection('eventos_partida')
      .where('matchId', '==', matchId)
      .where('type', '==', 'GOAL')
      .get();

    const goalCounts: Record<string, number> = {};
    eventsSnap.docs.forEach((doc: any) => {
      const { playerId } = doc.data();
      if (playerId) goalCounts[playerId] = (goalCounts[playerId] || 0) + 1;
    });

    const athleteUpdates = Object.entries(goalCounts).map(([playerId, count]) => {
      return adminDb.collection('atletas').doc(playerId).update({
        goals: FieldValue.increment(count)
      });
    });
    await Promise.all(athleteUpdates);

    // --- 4. Finalizar a Partida ---
    await matchRef.update({
      status: 'FINISHED',
      actualEndTime: FieldValue.serverTimestamp(),
      closedAt: FieldValue.serverTimestamp(),
      closedBy: userId,
      closedByName: userName,
      finalScore: finalScore,
      summaryLocked: true
    });

    // --- 5. Logs e Eventos ---
    const eventRef = adminDb.collection('eventos_partida').doc();
    await eventRef.set({
      matchId,
      type: 'MATCH_FINISHED',
      timestamp: FieldValue.serverTimestamp(),
      description: 'Partida encerrada',
      createdBy: userId,
      createdByName: userName,
      official: true
    });

    // Auditoria
    await adminDb.collection('logs_auditoria').add({
      matchId,
      matchName: `${matchData?.teamAName} vs ${matchData?.teamBName}`,
      action: 'FINISH_MATCH',
      userId,
      userName,
      timestamp: FieldValue.serverTimestamp()
    });

    // --- 6. Trigger Push via API de Notificações (opcional: usando adminMessaging direto se desejado, mas chamaremos a service interna ou endpoint)
    // Para simplificar e evitar dependencia circular, vamos apenas invocar a URL interna ou usar NotificationService.
    const pushMessage = `Partida Encerrada! ${matchData?.teamAName} ${finalScore} ${matchData?.teamBName}`;
    const baseUrl = req.nextUrl.origin;
    fetch(`${baseUrl}/api/admin/notifications/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: `${matchData?.teamAName} x ${matchData?.teamBName}`,
        message: pushMessage,
        target: 'all',
        type: 'success'
      })
    }).catch(e => console.warn('Erro ao disparar push no encerramento:', e));

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('[API Match Finish] Erro:', error);
    return NextResponse.json({ error: error.message || 'Erro interno.' }, { status: 500 });
  }
}
