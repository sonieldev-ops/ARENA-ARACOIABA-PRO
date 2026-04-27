import { adminDb } from "@/src/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { removeUndefined } from "@/src/lib/utils";

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
   * Registra um gol para o jogador no ranking do campeonato de forma idempotente.
   */
  static async registerGoal(input: RegisterGoalInput) {
    const { championshipId, playerId, playerName, teamId, teamName, eventId } = input;

    const scorerRef = adminDb
      .collection("classificacoes")
      .doc(championshipId)
      .collection("artilheiros")
      .doc(playerId);

    try {
      await adminDb.runTransaction(async (transaction: any) => {
        const snap = await transaction.get(scorerRef);

        if (!snap.exists) {
          transaction.set(scorerRef, removeUndefined({
            playerId,
            playerName,
            teamId,
            teamName,
            goals: 1,
            matchesPlayed: 1,
            lastEventIds: [eventId],
            updatedAt: FieldValue.serverTimestamp(),
          }));
        } else {
          const data = snap.data()!;
          const processedEvents = (data.lastEventIds || []) as string[];

          // Proteção contra processamento duplicado (idempotência)
          if (processedEvents.includes(eventId)) {
            console.log(`[ScorerService] Evento ${eventId} já processado para ${playerName}. Pulando.`);
            return;
          }

          const nextEvents = [...processedEvents, eventId].slice(-20); // Janela de segurança de 20 eventos

          transaction.update(scorerRef, removeUndefined({
            goals: (data.goals || 0) + 1,
            lastEventIds: nextEvents,
            updatedAt: FieldValue.serverTimestamp(),
          }));
        }
      });

      console.log(`[ScorerService] Gol registrado com sucesso: ${playerName} (${teamName})`);
    } catch (error) {
      console.error("[ScorerService] Erro ao registrar gol:", error);
      throw error;
    }
  }
}
