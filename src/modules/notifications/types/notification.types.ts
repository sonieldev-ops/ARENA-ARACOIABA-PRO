import { Timestamp } from 'firebase/firestore';

export enum NotificationType {
  USER_APPROVED = 'USER_APPROVED',
  USER_REJECTED = 'USER_REJECTED',
  USER_ROLE_CHANGED = 'USER_ROLE_CHANGED',
  USER_SUSPENDED = 'USER_SUSPENDED',
  USER_BLOCKED = 'USER_BLOCKED',
  USER_REACTIVATED = 'USER_REACTIVATED',
  USER_STATUS_CHANGED = 'USER_STATUS_CHANGED',
  MATCH_UPDATE = 'MATCH_UPDATE',
  CHAMPIONSHIP_ALERT = 'CHAMPIONSHIP_ALERT',
  SYSTEM_NOTICE = 'SYSTEM_NOTICE',
  SYSTEM_ALERT = 'SYSTEM_ALERT',
  GENERIC = 'GENERIC'
}

export enum NotificationPriority {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export enum NotificationCategory {
  ACCESS = 'ACCESS',
  MATCH = 'MATCH',
  CHAMPIONSHIP = 'CHAMPIONSHIP',
  ADMIN = 'ADMIN',
  SYSTEM = 'SYSTEM'
}

export enum NotificationChannel {
  IN_APP = 'IN_APP',
  PUSH = 'PUSH',
  EMAIL = 'EMAIL',
  SMS = 'SMS'
}

export enum NotificationDeliveryStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  READ = 'READ',
  FAILED = 'FAILED'
}

export interface AdminNotificationMetadata {
  correlationId: string;
  actorUserId: string;
  targetUserId?: string;
  sourceAction?: string;
  reason?: string;
  previousRole?: string;
  nextRole?: string;
  previousStatus?: string;
  nextStatus?: string;
}


export interface NotificationItem {
  id: string;
  userId: string;
  type: NotificationType;
  category: NotificationCategory;
  priority: NotificationPriority;
  title: string;
  message: string;
  shortMessage?: string;
  data?: Record<string, any>;
  isRead: boolean;
  createdAt: Timestamp;
  readAt?: Timestamp;
  sourceAction?: string;
  correlationId?: string;
  actorUserId?: string;
  targetUserId?: string;
  templateKey?: string;
  deepLinkWeb?: string;
  deepLinkAndroid?: string;
  icon?: string;
  expiresAt?: Timestamp;
}

export interface NotificationFilterState {
  type?: NotificationType[];
  category?: NotificationCategory[];
  priority?: NotificationPriority[];
  isRead?: boolean;
  startDate?: Date;
  endDate?: Date;
}

export interface NotificationCounters {
  unreadCount: number;
  lastUpdatedAt: Timestamp;
}
