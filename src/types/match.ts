export type MatchStatus = 'SCHEDULED' | 'LIVE' | 'FINISHED' | 'CANCELED';

export interface Match {
  id: string;
  championshipId: string;
  championshipName: string;
  // Estrutura atualizada para refletir o banco real
  teamAId: string;
  teamAName: string;
  teamBId: string;
  teamBName: string;
  scoreA: number;
  scoreB: number;
  status: MatchStatus;
  location: string;
  scheduledDate: any; // Firebase Timestamp
  actualStartTime?: any;
  actualEndTime?: any;
  createdAt: any;
  // Novos campos para períodos e acréscimos
  currentPeriod?: '1T' | 'INTERVALO' | '2T' | 'FIM';
  stoppageTime?: number;
  // Novos campos para travamento da súmula
  closedAt?: any;
  closedBy?: string;
  closedByName?: string;
  finalScore?: string;
  summaryLocked?: boolean;
  referees?: {
    main?: string;
    mainName?: string;
    assistant1?: string;
    assistant1Name?: string;
    assistant2?: string;
    assistant2Name?: string;
    fourth?: string;
    fourthName?: string;
    scorer?: string;
    scorerName?: string;
  };
}

export type EventType =
  | 'MATCH_STARTED'
  | 'GOAL'
  | 'YELLOW_CARD'
  | 'RED_CARD'
  | 'MATCH_PAUSED'
  | 'MATCH_RESUMED'
  | 'MATCH_FINISHED'
  | 'OBSERVATION'
  | 'SUBSTITUTION' // Mantido para retrocompatibilidade se necessário
  | 'START'        // Mantido para retrocompatibilidade
  | 'END';          // Mantido para retrocompatibilidade

export interface MatchEvent {
  id?: string;
  matchId: string;
  type: EventType;
  timestamp: any; // Mapeado para createdAt no novo formato
  minute?: string;
  athleteId?: string; // Anteriormente playerId
  athleteName?: string; // Anteriormente playerName
  teamId?: string;
  teamName?: string;
  description?: string;
  createdAt?: any;
  createdBy?: string;
  createdByName?: string;
  official?: boolean;
  // Campos legados mantidos para evitar quebras imediatas
  playerId?: string;
  playerName?: string;
  playerOutId?: string;
  playerInId?: string;
}

export interface AuditLog {
  id?: string;
  matchId: string;
  matchName?: string;
  action: string;
  userId: string;
  userName: string;
  timestamp: any;
  details?: any;
}
