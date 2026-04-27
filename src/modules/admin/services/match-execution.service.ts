import { adminDb } from "@/src/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

export async function registerGoal(matchId: string, teamId: string, athleteId: string, minute: number) {
  const matchRef = adminDb.collection("matches").doc(matchId);
  const athleteRef = adminDb.collection("athletes").doc(athleteId);

  return adminDb.runTransaction(async (transaction) => {
    const matchDoc = await transaction.get(matchRef);
    if (!matchDoc.exists) throw new Error("Partida não encontrada");

    const matchData = matchDoc.data()!;
    const isTeamA = matchData.teamAId === teamId;

    const event = {
      type: 'GOAL',
      teamId,
      athleteId,
      minute,
      timestamp: new Date().toISOString()
    };

    transaction.update(matchRef, {
      [isTeamA ? 'scoreA' : 'scoreB']: FieldValue.increment(1),
      events: FieldValue.arrayUnion(event),
      updatedAt: FieldValue.serverTimestamp()
    });

    transaction.update(athleteRef, {
      goals: FieldValue.increment(1),
      updatedAt: FieldValue.serverTimestamp()
    });

    return { success: true };
  });
}

export async function startMatch(matchId: string) {
  const matchRef = adminDb.collection("matches").doc(matchId);
  await matchRef.update({
    status: 'LIVE',
    startedAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp()
  });
}

export async function finishMatch(matchId: string) {
  const matchRef = adminDb.collection("matches").doc(matchId);
  await matchRef.update({
    status: 'FINISHED',
    finishedAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp()
  });
}
