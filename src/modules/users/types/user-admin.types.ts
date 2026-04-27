import { UserRole, UserStatus } from '@/src/types/auth';

export interface UserAdminRow {
  uid: string;
  fullName: string;
  email: string;
  phone?: string;
  role: UserRole;
  status: UserStatus;
  isApproved: boolean;
  approvalRequired: boolean;
  requestedRole?: UserRole;
  createdAt: any;
  updatedAt: any;
  lastRoleChangeAt?: any;
  lastRoleChangeBy?: string;
  lastApprovalAt?: any;
  lastApprovalBy?: string;
  blockedReason?: string;
  suspensionReason?: string;
}

export interface ApproveUserPayload {
  targetUserId: string;
}

export interface RejectUserPayload {
  targetUserId: string;
  reason: string;
}

export interface ChangeUserAccessPayload {
  targetUserId: string;
  nextRole?: UserRole;
  nextStatus?: UserStatus;
  reason?: string;
  revokeSessions?: boolean;
}

export interface UserAdminStats {
  total: number;
  pending: number;
  active: number;
  suspended: number;
  blocked: number;
}
