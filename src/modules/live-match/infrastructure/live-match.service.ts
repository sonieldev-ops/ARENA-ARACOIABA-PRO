import { db } from "@/src/lib/firebase/client";
import {
  doc,
  updateDoc,
  serverTimestamp,
  collection,
  runTransaction,
  setDoc
} from "firebase/firestore";
import { removeUndefined } from "@/src/lib/utils";

export const liveMatchService = {
  async startMatch(matchId: string) {
    const matchRef = doc(db, "partidas", matchId);
    try {
      await updateDoc(matchRef, removeUndefined({
        status: "LIVE",
        startedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        scoreA: 0,
        scoreB: 0
      }));
      fetch('/api/admin/matches/live', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'START', matchId })
      }).catch(() => {});
    } catch (error: any) {
      console.error("Erro ao iniciar:", error);
      throw error;
    }
  },

  async finishMatch(matchId: string) {
    const matchRef = doc(db, "partidas", matchId);
    await updateDoc(matchRef, removeUndefined({
      status: "FINISHED",
      finishedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }));
  },

  async registerGoal(matchId: string, teamSide: 'A' | 'B', athlete: any, currentMinute: number, matchData: any) {
    const teamId = String((teamSide === 'A' ? matchData?.teamAId : matchData?.teamBId) || "no-team");
    const teamName = String((teamSide === 'A' ? matchData?.teamAName : matchData?.teamBName) || "Time");
    const name = String(athlete?.name || "GOL");
    const id = String(athlete?.id || "geral");

    const matchRef = doc(db, "partidas", matchId);
    await runTransaction(db, async (transaction) => {
      const docSnap = await transaction.get(matchRef);
      const data = docSnap.data() || {};
      const currentScore = data[`score${teamSide}`] || 0;

      transaction.update(matchRef, removeUndefined({
        [`score${teamSide}`]: currentScore + 1,
        updatedAt: serverTimestamp()
      }));

      const eventRef = doc(collection(db, "partidas", matchId, "events"));

      // OBJETO ULTRA-REDUNDANTE PARA SATISFAZER TRIGGERS/EXTENSIONS INVISÍVEIS
      const redundantEvent = removeUndefined({
        type: "GOAL",
        teamId: teamId,
        teamName: teamName,
        athleteId: id || null,
        playerId: id || null,
        athleteName: name || null,
        playerName: name || null,
        name: name || null,
        label: name || null,
        minute: Number(currentMinute),
        createdAt: serverTimestamp(),
        // Campos extras que extensões costumam pedir
        matchId: String(matchId),
        timestamp: Date.now()
      });

      transaction.set(eventRef, redundantEvent);
    });
  },

  async registerCard(matchId: string, type: 'YELLOW' | 'RED', teamSide: 'A' | 'B', athlete: any, currentMinute: number, matchData: any) {
    const teamId = String((teamSide === 'A' ? matchData?.teamAId : matchData?.teamBId) || "no-team");
    const teamName = String((teamSide === 'A' ? matchData?.teamAName : matchData?.teamBName) || "Time");
    const name = String(athlete?.name || "Jogador");
    const id = String(athlete?.id || "geral");

    const eventRef = doc(collection(db, "partidas", matchId, "events"));
    await setDoc(eventRef, removeUndefined({
        type: type === 'YELLOW' ? "YELLOW_CARD" : "RED_CARD",
        teamId: teamId,
        teamName: teamName,
        athleteId: id || null,
        playerId: id || null,
        athleteName: name || null,
        playerName: name || null,
        name: name || null,
        label: name || null,
        minute: Number(currentMinute),
        createdAt: serverTimestamp(),
        matchId: String(matchId),
        timestamp: Date.now()
    }));
  }
};
