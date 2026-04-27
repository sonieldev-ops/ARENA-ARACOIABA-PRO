import { UserRole, UserStatus } from '@/src/types/auth';

export type BulkActionType = 'APPROVE' | 'REJECT' | 'CHANGE_ACCESS';

export interface BulkItemResult {
  targetUserId: string;
  fullName: string;
  success: boolean;
  message: string;
  nextRole?: UserRole;
  nextStatus?: UserStatus;
}

export interface BulkOperationResult {
  action: BulkActionType;
  totalRequested: number;
  totalSucceeded: number;
  totalFailed: number;
  items: BulkItemResult[];
  correlationId: string;
}

export interface BulkApprovePayload {
  targetUserIds: string[];
}

export interface BulkRejectPayload {
  targetUserIds: string[];
  reason: string;
}

export interface BulkChangeAccessPayload {
  targetUserIds: string[];
  nextRole?: UserRole;
  nextStatus?: UserStatus;
  reason?: string;
  revokeSessions?: boolean;
}
