import { adminDb } from "@/src/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { removeUndefined } from "@/src/lib/utils";

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
    const matchRef = adminDb.collection("partidas").doc();

    const matchData = {
      ...input,
      scoreA: 0,
      scoreB: 0,
      status: "SCHEDULED",
      teamIds: [input.teamAId, input.teamBId].filter(id => !!id),
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      // Garante que campos de data sejam Timestamps se vierem como string/ISO
      date: input.date ? (typeof input.date === 'string' ? new Date(input.date) : input.date) : FieldValue.serverTimestamp(),
    };

    await matchRef.set(removeUndefined(matchData));
    return { id: matchRef.id, ...matchData };
  }

  /**
   * Atualiza o placar e o status da partida em tempo real.
   */
  async updateScore(matchId: string, scoreA: number, scoreB: number, status: string) {
    const matchRef = adminDb.collection("partidas").doc(matchId);

    await matchRef.update(removeUndefined({
      scoreA,
      scoreB,
      status,
      updatedAt: FieldValue.serverTimestamp(),
    }));

    // Se a partida terminou, poderíamos disparar o ranking aqui futuramente
    return { success: true };
  }
  async list() {
    const snapshot = await adminDb.collection("partidas").orderBy("date", "desc").get();
    return snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date?.toDate?.() || doc.data().date // Handle Firestore Timestamp
    }));
  }
}

export const matchAdminService = new MatchAdminService();
