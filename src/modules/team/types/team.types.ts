import { Timestamp } from 'firebase/firestore';

export type TeamRole = 'MANAGER' | 'PLAYER' | 'STAFF' | 'CAPTAIN';
export type TeamMemberStatus = 'ACTIVE' | 'PENDING' | 'REJECTED';
export type InviteStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';

export interface Team {
  id: string;
  name: string;
  managerId: string;
  logoUrl?: string;
  category: string; // ex: 'LIVRE', 'VETERANO'
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface TeamMember {
  userId: string;
  userName: string;
  userEmail: string;
  role: TeamRole;
  status: TeamMemberStatus;
  joinedAt: Timestamp;
  stats?: {
    matches: number;
    goals: number;
  };
}

export interface TeamInvite {
  id: string;
  teamId: string;
  teamName: string;
  invitedEmail: string;
  role: TeamRole;
  status: InviteStatus;
  createdAt: Timestamp;
}

export interface Competition {
  id: string;
  name: string;
  status: 'OPEN_REGISTRATION' | 'IN_PROGRESS' | 'FINISHED';
  startDate: Timestamp;
  rulesUrl?: string;
}

export interface TeamDashboardData {
  team: Team | null;
  members: TeamMember[];
  invites: TeamInvite[];
  availableCompetitions: Competition[];
}
