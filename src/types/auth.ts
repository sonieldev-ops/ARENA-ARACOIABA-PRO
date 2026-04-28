export enum UserRole {
  SUPER_ADMIN = "SUPER_ADMIN",
  ADMIN = "ADMIN",
  ORGANIZER = "ORGANIZER",
  REFEREE = "REFEREE",
  STAFF = "STAFF",
  TEAM_MANAGER = "TEAM_MANAGER",
  ATHLETE = "ATHLETE",
  PUBLIC_USER = "PUBLIC_USER",
}

export enum UserStatus {
  PENDING_APPROVAL = "PENDING_APPROVAL",
  ACTIVE = "ACTIVE",
  SUSPENDED = "SUSPENDED",
  BLOCKED = "BLOCKED",
  REJECTED = "REJECTED",
  DEACTIVATED = "DEACTIVATED",
}

export interface BaseTimestamp {
  seconds: number;
  nanoseconds: number;
}

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  isApproved: boolean;
  accessVersion: number;
}

export interface UserProfile {
  uid: string;
  fullName: string;
  email: string;
  phone?: string;
  role: UserRole;
  status: UserStatus;
  isApproved: boolean;
  approvalRequired: boolean;
  accessVersion: number; // Incrementado em mudanças críticas
  requestedRole?: UserRole;
  teamId?: string;
  championshipIds?: string[];
  city?: string;
  photoUrl?: string;
  createdAt: BaseTimestamp | Date;
  updatedAt: BaseTimestamp | Date;
  createdBy?: string;
  lastRoleChangeAt?: BaseTimestamp | Date;
  lastRoleChangeBy?: string;
  lastApprovalAt?: BaseTimestamp | Date;
  lastApprovalBy?: string;
  blockedReason?: string;
  suspensionReason?: string;
  metadata?: {
    lastLogin?: BaseTimestamp | Date;
    appVersion?: string;
  };
  preferences?: Record<string, unknown>;
}
