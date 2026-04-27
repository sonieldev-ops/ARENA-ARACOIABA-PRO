export type MatchStatus = 'SCHEDULED' | 'LIVE' | 'FINISHED' | 'CANCELED';

export interface Team {
  id: string;
  name: string;
  logoUrl?: string;
  score: number;
}

export interface Player {
  id: string;
  name: string;
  number?: string;
  teamId: string;
}

export interface Match {
  id: string;
  homeTeam: Team;
  awayTeam: Team;
  status: MatchStatus;
  startTime?: any;
  endTime?: any;
  location?: string;
  currentPeriod?: number;
}

export type EventType = 'GOAL' | 'YELLOW_CARD' | 'RED_CARD' | 'SUBSTITUTION' | 'START' | 'END' | 'PERIOD_START' | 'PERIOD_END';

export interface MatchEvent {
  id?: string;
  matchId: string;
  type: EventType;
  timestamp: any;
  teamId?: string;
  playerId?: string;
  playerName?: string;
  assistantId?: string;
  playerOutId?: string; // For substitution
  playerInId?: string;  // For substitution
  minute?: number;
  description?: string;
}

export interface AuditLog {
  id?: string;
  matchId: string;
  action: string;
  userId: string;
  userName: string;
  timestamp: any;
  details?: any;
}
