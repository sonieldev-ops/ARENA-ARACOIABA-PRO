import { adminDb } from "@/src/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

export interface CreateMatchInput {
  teamAId: string;
  teamAName: string;
  teamBId: string;
  teamBName: string;
  date: Date;
  location: string;
  competitionId: string;
}

export class MatchAdminService {
  /**
   * Cria uma nova partida no sistema.
   */
  async createMatch(input: CreateMatchInput) {
    const matchRef = adminDb.collection("matches").doc();

    const matchData = {
      ...input,
      scoreA: 0,
      scoreB: 0,
      status: "SCHEDULED",
      teamIds: [input.teamAId, input.teamBId],
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    await matchRef.set(matchData);
    return { id: matchRef.id, ...matchData };
  }

  /**
   * Atualiza o placar e o status da partida em tempo real.
   */
  async updateScore(matchId: string, scoreA: number, scoreB: number, status: string) {
    const matchRef = adminDb.collection("matches").doc(matchId);

    await matchRef.update({
      scoreA,
      scoreB,
      status,
      updatedAt: FieldValue.serverTimestamp(),
    });

    // Se a partida terminou, poderíamos disparar o ranking aqui futuramente
    return { success: true };
  }
}

export const matchAdminService = new MatchAdminService();
