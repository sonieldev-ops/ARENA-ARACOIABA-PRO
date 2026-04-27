import { adminDb } from "@/src/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

export interface RegisterGoalInput {
  championshipId: string;
  playerId: string;
  playerName: string;
  teamId: string;
  teamName: string;
  matchId: string;
  eventId: string;
}

export class ScorerService {
  /**
   * Registra um gol para o jogador no ranking do campeonato.
   * Implementação atômica para evitar inconsistências.
   */
  static async registerGoal(input: RegisterGoalInput) {
    const { championshipId, playerId, playerName, teamId, teamName } = input;

    const scorerRef = adminDb
      .collection("rankings")
      .doc(championshipId)
      .collection("scorers")
      .doc(playerId);

    try {
      await adminDb.runTransaction(async (transaction) => {
        const snap = await transaction.get(scorerRef);

        if (!snap.exists) {
          transaction.set(scorerRef, {
            playerId,
            playerName,
            teamId,
            teamName,
            goals: 1,
            matchesPlayed: 1, // Poderia ser calculado via eventos de participação
            updatedAt: FieldValue.serverTimestamp(),
          });
        } else {
          const currentGoals = snap.data()?.goals || 0;
          transaction.update(scorerRef, {
            goals: currentGoals + 1,
            updatedAt: FieldValue.serverTimestamp(),
          });
        }
      });

      console.log(`[ScorerService] Gol registrado para ${playerName} (${teamName})`);
    } catch (error) {
      console.error("[ScorerService] Erro ao registrar gol:", error);
      throw error;
    }
  }
}
