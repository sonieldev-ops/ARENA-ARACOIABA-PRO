import { db } from "@/src/lib/firebase/client";
import {
  doc,
  updateDoc,
  serverTimestamp,
  runTransaction,
  collection,
  addDoc,
  Timestamp
} from "firebase/firestore";

export const liveMatchService = {
  async startMatch(matchId: string) {
    const matchRef = doc(db, "matches", matchId);
    await updateDoc(matchRef, {
      status: "LIVE",
      startedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  },

  async finishMatch(matchId: string) {
    const matchRef = doc(db, "matches", matchId);
    await updateDoc(matchRef, {
      status: "FINISHED",
      finishedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Trigger para recalcular ranking via API (opcional, ou pode ser via Cloud Function)
    try {
      await fetch('/api/admin/ranking/recalculate', { method: 'POST' });
    } catch (e) {
      console.error("Erro ao disparar recálculo de ranking", e);
    }
  },

  async registerGoal(matchId: string, teamSide: 'A' | 'B', athlete: any, currentMinute: number) {
    const matchRef = doc(db, "matches", matchId);
    const eventRef = collection(db, "matches", matchId, "events");

    await runTransaction(db, async (transaction) => {
      const matchDoc = await transaction.get(matchRef);
      if (!matchDoc.exists()) throw "Partida não existe";

      const matchData = matchDoc.data();
      const newScore = (matchData[`score${teamSide}`] || 0) + 1;

      // 1. Atualiza Placar
      transaction.update(matchRef, {
        [`score${teamSide}`]: newScore,
        updatedAt: serverTimestamp()
      });

      // 2. Cria Evento
      const newEvent = {
        type: "GOAL",
        teamId: teamSide === 'A' ? matchData.teamAId : matchData.teamBId,
        teamName: teamSide === 'A' ? matchData.teamAName : matchData.teamBName,
        athleteId: athlete?.id || null,
        athleteName: athlete?.name || "GOL",
        minute: currentMinute,
        createdAt: serverTimestamp(),
      };

      const newEventRef = doc(eventRef);
      transaction.set(newEventRef, newEvent);
    });
  },

  async registerCard(matchId: string, type: 'YELLOW' | 'RED', teamSide: 'A' | 'B', athlete: any, currentMinute: number) {
    const matchRef = doc(db, "matches", matchId);
    const eventRef = collection(db, "matches", matchId, "events");

    const matchDoc = await (await doc(db, "matches", matchId)).id; // apenas para validacao se necessario

    await addDoc(eventRef, {
      type: type === 'YELLOW' ? "YELLOW_CARD" : "RED_CARD",
      teamId: teamSide === 'A' ? "teamA" : "teamB", // Idealmente buscar do doc
      athleteId: athlete?.id || null,
      athleteName: athlete?.name || "Jogador",
      minute: currentMinute,
      createdAt: serverTimestamp(),
    });
  }
};
