import { MatchLiveStatus, MatchPeriod, MatchEventType, MatchEventState } from "@prisma/client";

export interface LiveMatchState {
  id: string;
  matchId: string;
  status: MatchLiveStatus;
  currentPeriod: MatchPeriod;
  homeScore: number;
  awayScore: number;
  homePenaltyScore?: number | null;
  awayPenaltyScore?: number | null;
  currentMinute: number;
  currentSecond: number;
  lastSequenceNumber: number;
  version: number;
  isActive: boolean;
  isHomologated: boolean;
  homeTeamId: string;
  awayTeamId: string;
}

export interface MatchEvent {
  id: string;
  matchId: string;
  liveMatchId: string;
  type: MatchEventType;
  state: MatchEventState;
  minute: number;
  second: number;
  period: MatchPeriod;
  teamId?: string | null;
  athleteId?: string | null;
  relatedAthleteId?: string | null;
  actorUserId: string;
  payload?: any;
  sequenceNumber: number;
  isReverted: boolean;
  correlationId?: string | null;
  createdAt: Date;
}
