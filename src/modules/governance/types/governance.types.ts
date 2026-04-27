import { UserRole, UserStatus } from '@/src/types/auth';

export interface GovernanceKpi {
  label: string;
  value: number;
  trend?: number;
  description: string;
  variant: 'default' | 'success' | 'warning' | 'destructive' | 'info';
  link?: string;
}

export interface GovernanceAlert {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  actionLabel?: string;
  actionUrl?: string;
  createdAt: any;
}

export interface AuditActionMetric {
  date: string;
  count: number;
  action: string;
}

export interface RoleChangeMetric {
  role: UserRole;
  count: number;
}

export interface StatusDistributionItem {
  status: UserStatus;
  count: number;
  color: string;
}

export interface TopOperatorMetric {
  uid: string;
  fullName: string;
  actionCount: number;
  lastAction: string;
  lastActionAt: any;
}

export interface RecentAuditItem {
  id: string;
  actorUserId: string;
  actorName: string;
  targetUserId: string;
  targetName: string;
  action: string;
  reason?: any;
  createdAt: any;
  correlationId: string;
}

export interface GovernanceFilterState {
  period: 'today' | '7d' | '30d' | 'custom';
  startDate?: Date;
  endDate?: Date;
  operatorId?: string;
  actionType?: string;
}

export interface GovernanceSummary {
  kpis: GovernanceKpi[];
  alerts: GovernanceAlert[];
  statusDistribution: StatusDistributionItem[];
  recentAudit: RecentAuditItem[];
  topOperators: TopOperatorMetric[];
  charts: {
    auditActions: AuditActionMetric[];
    roleChanges: RoleChangeMetric[];
  };
}
