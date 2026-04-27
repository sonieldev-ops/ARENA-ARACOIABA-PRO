import { UserProfile } from "@/src/types/auth";

export interface AdminDashboardMetrics {
  totalUsers: number;
  pendingUsers: number;
  activeUsers: number;
  totalAdmins: number;
  auditEventsLast24h: number;
  totalChampionships: number;
  totalTeams: number;
  totalAthletes: number;
  totalLiveMatches: number;
}

export interface AuditEvent {
  id: string;
  action: string;
  operatorName: string;
  operatorUid: string;
  targetName?: string;
  targetUid?: string;
  timestamp: any;
  details?: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
}

export interface AdminDashboardData {
  metrics: AdminDashboardMetrics;
  recentPendingUsers: UserProfile[];
  recentAuditEvents: AuditEvent[];
}
