export interface Match {
  id: string;
  teamA: string;
  teamB: string;
  date: any;
  location: string;
  status: 'SCHEDULED' | 'FINISHED' | 'LIVE';
  scoreA?: number;
  scoreB?: number;
}

export interface RankingInfo {
  position: number;
  points: number;
  played: number;
  wins: number;
}

export interface AthleteNotification {
  id: string;
  message: string;
  type: 'INVITE' | 'MATCH' | 'SYSTEM';
  createdAt: any;
  read: boolean;
}

export interface AthleteDashboardData {
  profile: {
    uid: string;
    fullName: string;
    teamId?: string;
    teamName?: string;
    photoURL?: string;
  };
  matches: Match[];
  ranking?: RankingInfo;
  notifications: AthleteNotification[];
}
