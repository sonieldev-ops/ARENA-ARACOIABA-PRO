import { UserProfile, UserRole, UserStatus } from '@/src/types/auth';

export interface AdminAuditLog {
  id: string;
  actorUserId: string;
  targetUserId: string;
  action: string;
  before: any;
  after: any;
  reason?: string | null;
  source: string;
  correlationId?: string | null;
  createdAt: any; // Timestamp
}

export interface UserAuditFilterState {
  action?: string;
  source?: string;
  startDate?: Date;
  endDate?: Date;
}

export type AuditActionType =
  | 'USER_APPROVED'
  | 'USER_REJECTED'
  | 'USER_ACCESS_CHANGED'
  | 'USER_BLOCKED'
  | 'USER_SUSPENDED'
  | 'USER_REACTIVATED'
  | 'SIGNUP';
