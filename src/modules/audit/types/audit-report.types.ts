import { Timestamp } from 'firebase/firestore';
import { UserProfile } from '@/types/auth';

export type AuditSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type AuditSource = 'ADMIN_PANEL' | 'APP_CLIENT' | 'CLOUD_FUNCTION' | 'SYSTEM' | 'EXTERNAL_API';

export type AuditAction =
  | 'USER_APPROVE'
  | 'USER_REJECT'
  | 'USER_BLOCK'
  | 'USER_SUSPEND'
  | 'USER_REACTIVATE'
  | 'ROLE_UPDATE'
  | 'STATUS_UPDATE'
  | 'PERMISSION_GRANT'
  | 'SETTINGS_CHANGE'
  | 'SENSITIVE_DATA_ACCESS'
  | 'MASS_ACTION';

export interface AuditLogItem {
  id: string;
  actorUserId: string;
  actorName?: string;
  actorEmail?: string;
  targetUserId?: string;
  targetName?: string;
  targetEmail?: string;
  action: AuditAction;
  severity: AuditSeverity;
  source: AuditSource;
  correlationId: string;
  reason?: string;
  before?: Partial<UserProfile>;
  after?: Partial<UserProfile>;
  metadata?: {
    ip?: string;
    userAgent?: string;
    sessionId?: string;
    appVersion?: string;
  };
  createdAt: Timestamp;
}

export interface AuditFilterState {
  startDate: Date | null;
  endDate: Date | null;
  actorUserId?: string;
  targetUserId?: string;
  action?: AuditAction;
  severity?: AuditSeverity;
  source?: AuditSource;
  correlationId?: string;
}

export interface AuditSummary {
  totalEvents: number;
  criticalEvents: number;
  uniqueOperators: number;
  actionBreakdown: Record<string, number>;
  sourceBreakdown: Record<string, number>;
}

export interface AuditCorrelationGroup {
  correlationId: string;
  events: AuditLogItem[];
  startTime: Timestamp;
  endTime: Timestamp;
  actorUserIds: string[];
}
