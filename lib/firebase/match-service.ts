import {
  collection,
  doc,
  updateDoc,
  addDoc,
  serverTimestamp,
  increment,
  query,
  where,
  getDocs,
  onSnapshot,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { db } from './client';
import { Match, MatchEvent, MatchStatus, AuditLog } from '@/types/match';

export const MatchService = {
  // Buscar partidas ativas (SCHEDULED ou LIVE)
  async getActiveMatches() {
    const q = query(
      collection(db, 'matches'),
      where('status', 'in', ['SCHEDULED', 'LIVE']),
      orderBy('startTime', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Match));
  },

  // Iniciar partida
  async startMatch(matchId: string, userId: string, userName: string) {
    const matchRef = doc(db, 'matches', matchId);
    await updateDoc(matchRef, {
      status: 'LIVE',
      actualStartTime: serverTimestamp(),
    });

    await this.addEvent({
      matchId,
      type: 'START',
      timestamp: serverTimestamp(),
      description: 'Partida iniciada'
    });

    await this.addAuditLog({
      matchId,
      action: 'START_MATCH',
      userId,
      userName,
      timestamp: serverTimestamp()
    });
  },

  // Encerrar partida
  async finishMatch(matchId: string, userId: string, userName: string) {
    const matchRef = doc(db, 'matches', matchId);
    await updateDoc(matchRef, {
      status: 'FINISHED',
      actualEndTime: serverTimestamp(),
    });

    await this.addEvent({
      matchId,
      type: 'END',
      timestamp: serverTimestamp(),
      description: 'Partida encerrada'
    });

    await this.addAuditLog({
      matchId,
      action: 'FINISH_MATCH',
      userId,
      userName,
      timestamp: serverTimestamp()
    });
  },

  // Registrar Gol
  async registerGoal(matchId: string, teamId: string, player: { id: string, name: string }, isHomeTeam: boolean, userId: string, userName: string) {
    const matchRef = doc(db, 'matches', matchId);

    // Atualizar placar
    const scoreUpdate = isHomeTeam ? { 'homeTeam.score': increment(1) } : { 'awayTeam.score': increment(1) };
    await updateDoc(matchRef, scoreUpdate);

    // Adicionar evento
    await this.addEvent({
      matchId,
      type: 'GOAL',
      teamId,
      playerId: player.id,
      playerName: player.name,
      timestamp: serverTimestamp(),
      description: `Gol de ${player.name}`
    });

    await this.addAuditLog({
      matchId,
      action: 'REGISTER_GOAL',
      userId,
      userName,
      timestamp: serverTimestamp(),
      details: { teamId, playerId: player.id, playerName: player.name }
    });
  },

  // Registrar Cartão
  async registerCard(matchId: string, teamId: string, player: { id: string, name: string }, type: 'YELLOW_CARD' | 'RED_CARD', userId: string, userName: string) {
    await this.addEvent({
      matchId,
      type,
      teamId,
      playerId: player.id,
      playerName: player.name,
      timestamp: serverTimestamp(),
      description: `${type === 'YELLOW_CARD' ? 'Cartão Amarelo' : 'Cartão Vermelho'} para ${player.name}`
    });

    await this.addAuditLog({
      matchId,
      action: `REGISTER_${type}`,
      userId,
      userName,
      timestamp: serverTimestamp(),
      details: { teamId, playerId: player.id, playerName: player.name }
    });
  },

  // Registrar Substituição
  async registerSubstitution(matchId: string, teamId: string, playerOut: { id: string, name: string }, playerIn: { id: string, name: string }, userId: string, userName: string) {
    await this.addEvent({
      matchId,
      type: 'SUBSTITUTION',
      teamId,
      playerOutId: playerOut.id,
      playerInId: playerIn.id,
      timestamp: serverTimestamp(),
      description: `Substituição: Sai ${playerOut.name}, Entra ${playerIn.name}`
    });

    await this.addAuditLog({
      matchId,
      action: 'REGISTER_SUBSTITUTION',
      userId,
      userName,
      timestamp: serverTimestamp(),
      details: { teamId, playerOutId: playerOut.id, playerInId: playerIn.id }
    });
  },

  // Helpers internos
  async addEvent(event: MatchEvent) {
    return addDoc(collection(db, 'match_events'), event);
  },

  async addAuditLog(log: AuditLog) {
    return addDoc(collection(db, 'match_audit_logs'), log);
  },

  // Stream de uma partida específica
  subscribeToMatch(matchId: string, callback: (match: Match) => void) {
    return onSnapshot(doc(db, 'matches', matchId), (doc) => {
      if (doc.exists()) {
        callback({ id: doc.id, ...doc.data() } as Match);
      }
    });
  }
};
