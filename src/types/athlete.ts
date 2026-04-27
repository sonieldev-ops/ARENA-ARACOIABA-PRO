import { UserProfile } from "./auth";

export interface AthleteStats {
  matches: number;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
}

export interface TeamInfo {
  id: string;
  name: string;
  logoUrl?: string;
  category?: string;
}

export interface MatchInfo {
  id: string;
  opponent: string;
  date: any;
  location: string;
  competition: string;
  status: 'SCHEDULED' | 'LIVE' | 'FINISHED';
}

export interface AthleteNotification {
  id: string;
  title: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'SUCCESS';
  createdAt: any;
  read: boolean;
}

export interface AthleteDashboardData {
  profile: UserProfile;
  team: TeamInfo | null;
  nextMatch: MatchInfo | null;
  stats: AthleteStats;
  notifications: AthleteNotification[];
}
