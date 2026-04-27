import { adminDb } from "@/src/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { removeUndefined } from "@/src/lib/utils";

export class RankingService {
  /**
   * Recalcula todo o ranking de um campeonato de forma idempotente.
   */
  static async recalculate(championshipId: string) {
    console.log(`[RankingService] Recalculando campeonato: ${championshipId}`);

    const matchesSnap = await adminDb
      .collection("partidas")
      .where("competitionId", "==", championshipId)
      .where("status", "==", "FINISHED")
      .get();

    const table: Record<string, any> = {};

    matchesSnap.forEach((doc: any) => {
      const m = doc.data();
      const { teamAId, teamBId, scoreA, scoreB, teamAName, teamBName } = m;

      if (!table[teamAId]) table[teamAId] = this.createEmpty(teamAId, teamAName);
      if (!table[teamBId]) table[teamBId] = this.createEmpty(teamBId, teamBName);

      const teamA = table[teamAId];
      const teamB = table[teamBId];

      teamA.played++;
      teamB.played++;

      teamA.goalsFor += scoreA;
      teamA.goalsAgainst += scoreB;
      teamB.goalsFor += scoreB;
      teamB.goalsAgainst += scoreA;

      if (scoreA > scoreB) {
        teamA.wins++;
        teamB.losses++;
        teamA.points += 3;
      } else if (scoreB > scoreA) {
        teamB.wins++;
        teamA.losses++;
        teamB.points += 3;
      } else {
        teamA.draws++;
        teamB.draws++;
        teamA.points += 1;
        teamB.points += 1;
      }
    });

    // Calcular saldo e ordenar
    const sorted = Object.values(table)
      .map((t: any) => ({
        ...t,
        goalDifference: t.goalsFor - t.goalsAgainst
      }))
      .sort((a: any, b: any) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
        return b.goalsFor - a.goalsFor;
      });

    // Salvar em Batch
    const batch = adminDb.batch();
    const rankingRef = adminDb.collection("classificacoes").doc(championshipId).collection("times");

    sorted.forEach((team: any, index: number) => {
      const docRef = rankingRef.doc(team.teamId);
      batch.set(docRef, removeUndefined({
        ...team,
        position: index + 1,
        updatedAt: FieldValue.serverTimestamp(),
      }));
    });

    await batch.commit();
    console.log(`[RankingService] Ranking atualizado com sucesso para ${championshipId}`);
  }

  private static createEmpty(teamId: string, teamName: string) {
    return {
      teamId,
      teamName,
      played: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      points: 0,
    };
  }
}
