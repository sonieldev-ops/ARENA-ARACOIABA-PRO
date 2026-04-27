import { adminDb } from "@/src/lib/firebase/admin";
import { FieldValue, Transaction } from "firebase-admin/firestore";
import { updateRankingAfterMatch } from "./ranking-admin.service";
import { removeUndefined } from "@/src/lib/utils";

export async function registerGoal(matchId: string, teamId: string, athleteId: string | null | undefined, minute: number, athleteName?: string, assistId?: string | null, assistName?: string | null) {
  const matchRef = adminDb.collection("partidas").doc(matchId);

  return adminDb.runTransaction(async (transaction: Transaction) => {
    const matchDoc = await transaction.get(matchRef as any);
    if (!(matchDoc as any).exists) throw new Error("Partida não encontrada");

    const matchData = (matchDoc as any).data();
    const isTeamA = teamId === matchData?.teamAId;

    // Atualiza o placar
    transaction.update(matchRef, removeUndefined({
      [isTeamA ? 'scoreA' : 'scoreB']: FieldValue.increment(1),
      updatedAt: FieldValue.serverTimestamp()
    }));

    // Registra o evento de gol
    const eventRef = matchRef.collection("events").doc();
    transaction.set(eventRef, removeUndefined({
      type: 'GOAL',
      teamId,
      athleteId: athleteId ?? null,
      playerId: athleteId ?? null,
      playerName: athleteName ?? null,
      assistId: assistId ?? null,
      assistName: assistName ?? null,
      minute,
      createdAt: FieldValue.serverTimestamp()
    }));

    // Atualiza estatísticas do artilheiro (scorers)
    if (athleteId) {
      const scorerRef = adminDb.collection("artilheiros").doc(athleteId);
      transaction.set(scorerRef, {
        goals: FieldValue.increment(1),
        updatedAt: FieldValue.serverTimestamp()
      }, { merge: true });
    }
  });
}

export async function registerCard(matchId: string, teamId: string, athleteId: string | null | undefined, type: 'YELLOW' | 'RED', minute: number, athleteName?: string) {
  const matchRef = adminDb.collection("partidas").doc(matchId);

  const eventRef = matchRef.collection("events").doc();
  await eventRef.set(removeUndefined({
    type: 'CARD',
    cardType: type,
    teamId,
    athleteId: athleteId ?? null,
    playerId: athleteId ?? null,
    playerName: athleteName ?? null,
    minute,
    createdAt: FieldValue.serverTimestamp()
  }));
}

export async function registerSubstitution(matchId: string, teamId: string, playerOutId: string, playerInId: string, minute: number, playerOutName?: string, playerInName?: string) {
  const matchRef = adminDb.collection("partidas").doc(matchId);
  const eventRef = matchRef.collection("events").doc();

  await eventRef.set(removeUndefined({
    type: 'SUBSTITUTION',
    teamId,
    playerOutId: playerOutId ?? null,
    playerOutName: playerOutName ?? null,
    playerInId: playerInId ?? null,
    playerInName: playerInName ?? null,
    minute,
    createdAt: FieldValue.serverTimestamp()
  }));
}

export async function startMatch(matchId: string) {
  const matchRef = adminDb.collection("partidas").doc(matchId);
  await matchRef.update(removeUndefined({
    status: 'LIVE',
    startedAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp()
  }));
}

export async function finishMatch(matchId: string) {
  return adminDb.runTransaction(async (transaction: Transaction) => {
    const matchRef = adminDb.collection("partidas").doc(matchId);

    transaction.update(matchRef, removeUndefined({
      status: 'FINISHED',
      finishedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    }));

    await updateRankingAfterMatch(matchId, transaction);
  });
}
