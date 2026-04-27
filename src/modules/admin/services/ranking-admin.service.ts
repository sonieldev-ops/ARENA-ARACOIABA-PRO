import { adminDb } from "@/src/lib/firebase/admin";
import { FieldValue, Transaction } from "firebase-admin/firestore";
import { removeUndefined } from "@/src/lib/utils";

export async function updateRankingAfterMatch(matchId: string, transaction: Transaction) {
  const matchRef = adminDb.collection("partidas").doc(matchId);
  const matchDoc = await transaction.get(matchRef) as any;

  if (!matchDoc.exists) return;
  const match = matchDoc.data()!;

  if (match.status !== 'FINISHED') return;

  const { teamAId, teamBId, scoreA, scoreB, competitionId } = match;

  const teamARef = adminDb.collection("campeonatos").doc(competitionId).collection("ranking").doc(teamAId);
  const teamBRef = adminDb.collection("campeonatos").doc(competitionId).collection("ranking").doc(teamBId);

  // Determinar resultados
  let pointsA = 0, pointsB = 0;
  let winA = 0, winB = 0;
  let draw = 0;
  let lossA = 0, lossB = 0;

  if (scoreA > scoreB) {
    pointsA = 3; winA = 1; lossB = 1;
  } else if (scoreB > scoreA) {
    pointsB = 3; winB = 1; lossA = 1;
  } else {
    pointsA = 1; pointsB = 1; draw = 1;
  }

  const updateTeam = (points: number, wins: number, draws: number, losses: number, goalsFor: number, goalsAgainst: number) => ({
    points: FieldValue.increment(points),
    played: FieldValue.increment(1),
    wins: FieldValue.increment(wins),
    draws: FieldValue.increment(draws),
    losses: FieldValue.increment(losses),
    goalsFor: FieldValue.increment(goalsFor),
    goalsAgainst: FieldValue.increment(goalsAgainst),
    goalDifference: FieldValue.increment(goalsFor - goalsAgainst),
    updatedAt: FieldValue.serverTimestamp()
  });

  transaction.set(teamARef, removeUndefined(updateTeam(pointsA, winA, draw, lossA, scoreA, scoreB)), { merge: true });
  transaction.set(teamBRef, removeUndefined(updateTeam(pointsB, winB, draw, lossB, scoreB, scoreA)), { merge: true });
}
