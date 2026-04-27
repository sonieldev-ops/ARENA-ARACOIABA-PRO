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
  Timestamp,
  getDoc,
  setDoc
} from 'firebase/firestore';
import { db, auth } from './client';
import { removeUndefined, sanitizeData } from '@/src/lib/utils';
import { Match, MatchEvent, MatchStatus, AuditLog } from '@/src/types/match';

export const MatchService = {
  // Buscar partidas ativas (SCHEDULED ou LIVE)
  async getActiveMatches() {
    const q = query(
      collection(db, 'partidas'),
      where('status', 'in', ['SCHEDULED', 'LIVE']),
      orderBy('scheduledDate', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => sanitizeData({ id: doc.id, ...doc.data() }) as Match);
  },

  // Iniciar partida
  async startMatch(matchId: string, matchName: string, userId: string, userName: string) {
    const matchRef = doc(db, 'partidas', matchId);
    await updateDoc(matchRef, removeUndefined({
      status: 'LIVE',
      actualStartTime: serverTimestamp(),
      currentPeriod: '1T',
      stoppageTime: 0
    }));

    await this.addEvent({
      matchId,
      type: 'MATCH_STARTED',
      timestamp: serverTimestamp(),
      description: 'Partida iniciada',
      createdBy: userId,
      createdByName: userName,
      official: true
    });

    await this.addAuditLog({
      matchId,
      matchName,
      action: 'START_MATCH',
      userId,
      userName,
      timestamp: serverTimestamp()
    });

    this.sendMatchPush(matchName, 'A partida começou! Acompanhe em tempo real.');
  },

  // Encerrar partida e atualizar rankings via Backend API
  async finishMatch(matchId: string, userId: string, userName: string) {
    if (!auth.currentUser) throw new Error('Usuário não autenticado');
    const token = await auth.currentUser.getIdToken();
    
    const response = await fetch('/api/admin/matches/finish', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ matchId, userId, userName })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Erro ao encerrar a partida');
    }
  },

  // Registrar Gol
  async registerGoal(matchId: string, matchName: string, teamId: string, player: { id: string, name: string }, isTeamA: boolean, userId: string, userName: string, userRole?: string) {
    const matchRef = doc(db, 'partidas', matchId);
    const matchSnap = await getDoc(matchRef);
    const matchData = matchSnap.data();

    if (matchData?.summaryLocked && userRole !== 'SUPER_ADMIN') {
      throw new Error('Esta súmula está bloqueada. Apenas o Super Administrador pode realizar alterações.');
    }

    if (matchData?.summaryLocked && userRole === 'SUPER_ADMIN') {
       await this.addAuditLog({
         matchId,
         matchName,
         action: 'CRITICAL_GOAL_EDIT_LOCKED',
         userId,
         userName,
         timestamp: serverTimestamp(),
         details: `ALTERAÇÃO CRÍTICA: Super Admin registrou gol em súmula bloqueada. Atleta: ${player.name}`
       });
    }

    // Atualizar placar
    const scoreUpdate = isTeamA ? { 'scoreA': increment(1) } : { 'scoreB': increment(1) };
    await updateDoc(matchRef, removeUndefined(scoreUpdate));

    // Adicionar evento
    await this.addEvent({
      matchId,
      type: 'GOAL',
      teamId,
      teamName: isTeamA ? matchData?.teamAName : matchData?.teamBName,
      athleteId: player.id,
      athleteName: player.name,
      playerId: player.id, // Legacy
      playerName: player.name, // Legacy
      timestamp: serverTimestamp(),
      description: `Gol de ${player.name}`,
      createdBy: userId,
      createdByName: userName,
      official: true
    });

    await this.addAuditLog({
      matchId,
      matchName,
      action: 'REGISTER_GOAL',
      userId,
      userName,
      timestamp: serverTimestamp(),
      details: { teamId, playerId: player.id, playerName: player.name }
    });

    // Trigger Push Notification via API (shortcut)
    this.sendMatchPush(matchName, `GOL! ${player.name} marcou para o ${isTeamA ? matchData?.teamAName : matchData?.teamBName}!`);
  },

  async sendMatchPush(matchName: string, message: string) {
    try {
      fetch('/api/admin/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: matchName,
          message,
          target: 'all',
          type: 'success'
        })
      });
    } catch (e) {
      console.warn('Falha silenciosa ao disparar push:', e);
    }
  },

  // Registrar Cartão
  async registerCard(matchId: string, matchName: string, teamId: string, player: { id: string, name: string }, type: 'YELLOW_CARD' | 'RED_CARD', userId: string, userName: string, userRole?: string) {
    const matchRef = doc(db, 'partidas', matchId);
    const matchSnap = await getDoc(matchRef);
    const matchData = matchSnap.data();

    if (matchData?.summaryLocked && userRole !== 'SUPER_ADMIN') {
      throw new Error('Esta súmula está bloqueada. Cartões não podem mais ser registrados.');
    }

    if (matchData?.summaryLocked && userRole === 'SUPER_ADMIN') {
      await this.addAuditLog({
        matchId,
        matchName,
        action: 'CRITICAL_CARD_EDIT_LOCKED',
        userId,
        userName,
        timestamp: serverTimestamp(),
        details: `ALTERAÇÃO CRÍTICA: Super Admin aplicou cartão em súmula bloqueada. Atleta: ${player.name} (${type})`
      });
    }

    await this.addEvent({
      matchId,
      type,
      teamId,
      teamName: teamId === matchData?.teamAId ? matchData?.teamAName : matchData?.teamBName,
      athleteId: player.id,
      athleteName: player.name,
      playerId: player.id, // Legacy
      playerName: player.name, // Legacy
      timestamp: serverTimestamp(),
      description: `${type === 'YELLOW_CARD' ? 'Cartão Amarelo' : 'Cartão Vermelho'} para ${player.name}`,
      createdBy: userId,
      createdByName: userName,
      official: true
    });

    await this.addAuditLog({
      matchId,
      matchName,
      action: `REGISTER_${type}`,
      userId,
      userName,
      timestamp: serverTimestamp(),
      details: { teamId, playerId: player.id, playerName: player.name }
    });

    const cardLabel = type === 'YELLOW_CARD' ? 'Cartão Amarelo' : 'Cartão Vermelho';
    this.sendMatchPush(matchName, `${cardLabel} para ${player.name} (${teamId === matchData?.teamAId ? matchData?.teamAName : matchData?.teamBName})`);
  },

  // Registrar Substituição
  async registerSubstitution(matchId: string, matchName: string, teamId: string, playerOut: { id: string, name: string }, playerIn: { id: string, name: string }, userId: string, userName: string, userRole?: string) {
    const matchRef = doc(db, 'partidas', matchId);
    const matchSnap = await getDoc(matchRef);
    const matchData = matchSnap.data();

    if (matchData?.summaryLocked && userRole !== 'SUPER_ADMIN') {
      throw new Error('Esta súmula está bloqueada. Substituições não podem mais ser registradas.');
    }

    if (matchData?.summaryLocked && userRole === 'SUPER_ADMIN') {
      await this.addAuditLog({
        matchId,
        matchName,
        action: 'CRITICAL_SUBSTITUTION_EDIT_LOCKED',
        userId,
        userName,
        timestamp: serverTimestamp(),
        details: `ALTERAÇÃO CRÍTICA: Super Admin registrou substituição em súmula bloqueada. Sai: ${playerOut.name}, Entra: ${playerIn.name}`
      });
    }

    await this.addEvent({
      matchId,
      type: 'SUBSTITUTION',
      teamId,
      playerOutId: playerOut.id,
      playerInId: playerIn.id,
      timestamp: serverTimestamp(),
      description: `Substituição: Sai ${playerOut.name}, Entra ${playerIn.name}`,
      createdBy: userId,
      createdByName: userName,
      official: true
    });

    await this.addAuditLog({
      matchId,
      matchName,
      action: 'REGISTER_SUBSTITUTION',
      userId,
      userName,
      timestamp: serverTimestamp(),
      details: { teamId, playerOutId: playerOut.id, playerInId: playerIn.id }
    });
  },

  async pauseMatch(matchId: string, userId: string, userName: string, userRole?: string) {
    const matchRef = doc(db, 'partidas', matchId);
    const matchSnap = await getDoc(matchRef);
    if (matchSnap.data()?.summaryLocked && userRole !== 'SUPER_ADMIN') return;

    if (matchSnap.data()?.summaryLocked && userRole === 'SUPER_ADMIN') {
      await this.addAuditLog({
        matchId,
        matchName: matchSnap.data()?.teamAName + ' vs ' + matchSnap.data()?.teamBName,
        action: 'CRITICAL_PAUSE_EDIT_LOCKED',
        userId,
        userName,
        timestamp: serverTimestamp(),
        details: `ALTERAÇÃO CRÍTICA: Super Admin pausou partida em súmula bloqueada.`
      });
    }

    await updateDoc(matchRef, { isPaused: true });

    await this.addEvent({
      matchId,
      type: 'MATCH_PAUSED',
      timestamp: serverTimestamp(),
      description: 'Partida pausada pelo árbitro',
      createdBy: userId,
      createdByName: userName,
      official: true
    });
  },

  async resumeMatch(matchId: string, userId: string, userName: string, userRole?: string) {
    const matchRef = doc(db, 'partidas', matchId);
    const matchSnap = await getDoc(matchRef);
    if (matchSnap.data()?.summaryLocked && userRole !== 'SUPER_ADMIN') return;

    if (matchSnap.data()?.summaryLocked && userRole === 'SUPER_ADMIN') {
      await this.addAuditLog({
        matchId,
        matchName: matchSnap.data()?.teamAName + ' vs ' + matchSnap.data()?.teamBName,
        action: 'CRITICAL_RESUME_EDIT_LOCKED',
        userId,
        userName,
        timestamp: serverTimestamp(),
        details: `ALTERAÇÃO CRÍTICA: Super Admin retomou partida em súmula bloqueada.`
      });
    }

    await updateDoc(matchRef, { isPaused: false });

    await this.addEvent({
      matchId,
      type: 'MATCH_RESUMED',
      timestamp: serverTimestamp(),
      description: 'Partida retomada pelo árbitro',
      createdBy: userId,
      createdByName: userName,
      official: true
    });
  },

  async registerObservation(matchId: string, observation: string, userId: string, userName: string, userRole?: string) {
    const matchRef = doc(db, 'partidas', matchId);
    const matchSnap = await getDoc(matchRef);
    if (matchSnap.data()?.summaryLocked && userRole !== 'SUPER_ADMIN') {
      throw new Error('Súmula bloqueada.');
    }

    if (matchSnap.data()?.summaryLocked && userRole === 'SUPER_ADMIN') {
      await this.addAuditLog({
        matchId,
        matchName: matchSnap.data()?.teamAName + ' vs ' + matchSnap.data()?.teamBName,
        action: 'CRITICAL_OBSERVATION_EDIT_LOCKED',
        userId,
        userName,
        timestamp: serverTimestamp(),
        details: `ALTERAÇÃO CRÍTICA: Super Admin registrou observação em súmula bloqueada: ${observation}`
      });
    }

    await this.addEvent({
      matchId,
      type: 'OBSERVATION',
      timestamp: serverTimestamp(),
      description: observation,
      createdBy: userId,
      createdByName: userName,
      official: true
    });
  },

  async updateMatchPeriod(matchId: string, period: '1T' | 'INTERVALO' | '2T' | 'FIM', userId: string, userName: string, userRole?: string) {
    const matchRef = doc(db, 'partidas', matchId);
    const matchSnap = await getDoc(matchRef);
    if (matchSnap.data()?.summaryLocked && userRole !== 'SUPER_ADMIN') return;

    if (matchSnap.data()?.summaryLocked && userRole === 'SUPER_ADMIN') {
      await this.addAuditLog({
        matchId,
        matchName: matchSnap.data()?.teamAName + ' vs ' + matchSnap.data()?.teamBName,
        action: 'CRITICAL_PERIOD_EDIT_LOCKED',
        userId,
        userName,
        timestamp: serverTimestamp(),
        details: `ALTERAÇÃO CRÍTICA: Super Admin alterou período para ${period} em súmula bloqueada.`
      });
    }

    await updateDoc(matchRef, { currentPeriod: period });

    const labels = {
      '1T': 'Início do 1º Tempo',
      'INTERVALO': 'Intervalo',
      '2T': 'Início do 2º Tempo',
      'FIM': 'Fim de Jogo'
    };

    await this.addEvent({
      matchId,
      type: period === '1T' || period === '2T' ? 'MATCH_RESUMED' : 'MATCH_PAUSED',
      timestamp: serverTimestamp(),
      description: labels[period],
      createdBy: userId,
      createdByName: userName,
      official: true
    });
  },

  async updateStoppageTime(matchId: string, minutes: number, userId: string, userName: string, userRole?: string) {
    const matchRef = doc(db, 'partidas', matchId);
    const matchSnap = await getDoc(matchRef);
    if (matchSnap.data()?.summaryLocked && userRole !== 'SUPER_ADMIN') return;

    if (matchSnap.data()?.summaryLocked && userRole === 'SUPER_ADMIN') {
      await this.addAuditLog({
        matchId,
        matchName: matchSnap.data()?.teamAName + ' vs ' + matchSnap.data()?.teamBName,
        action: 'CRITICAL_STOPPAGE_EDIT_LOCKED',
        userId,
        userName,
        timestamp: serverTimestamp(),
        details: `ALTERAÇÃO CRÍTICA: Super Admin alterou acréscimos para ${minutes} min em súmula bloqueada.`
      });
    }

    await updateDoc(matchRef, { stoppageTime: minutes });

    if (minutes > 0) {
      await this.addEvent({
        matchId,
        type: 'OBSERVATION',
        timestamp: serverTimestamp(),
        description: `Acréscimos: +${minutes} minutos`,
        createdBy: userId,
        createdByName: userName,
        official: true
      });
    }
  },

  // Helpers internos
  async addEvent(event: MatchEvent & { id?: string }) {
    const { matchId, id, ...eventData } = event;
    const eventId = id || doc(collection(db, 'partidas', matchId, 'events')).id;

    // Salva na subcoleção recomendada
    const eventsRef = doc(db, 'partidas', matchId, 'events', eventId);
    await setDoc(eventsRef, removeUndefined({
      ...eventData,
      matchId,
      official: true,
      createdAt: serverTimestamp(),
    }));

    // Mantém compatibilidade com a coleção global se necessário (opcional)
    const globalEventRef = doc(db, 'eventos_partida', eventId);
    await setDoc(globalEventRef, removeUndefined({
      ...eventData,
      matchId,
      id: eventId
    }));

    return { id: eventId };
  },

  async addAuditLog(log: AuditLog) {
    return addDoc(collection(db, 'logs_auditoria'), removeUndefined(log));
  },

  subscribeToMatch(matchId: string, callback: (match: Match) => void) {
    return onSnapshot(doc(db, 'partidas', matchId), (doc) => {
      if (doc.exists()) {
        callback(sanitizeData({ id: doc.id, ...doc.data() }) as Match);
      }
    });
  },

  subscribeToMatchEvents(matchId: string, callback: (events: MatchEvent[]) => void) {
    const q = query(
      collection(db, 'partidas', matchId, 'events'),
      orderBy('timestamp', 'asc')
    );
    return onSnapshot(q, (snapshot) => {
      const events = snapshot.docs.map(doc => sanitizeData({ id: doc.id, ...doc.data() }) as MatchEvent);
      callback(events);
    });
  }
};
