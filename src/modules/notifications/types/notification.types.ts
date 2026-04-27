import { UserRole, UserStatus } from '@/src/types/auth';

export enum NotificationType {
  USER_APPROVED = 'USER_APPROVED',
  USER_REJECTED = 'USER_REJECTED',
  USER_ROLE_CHANGED = 'USER_ROLE_CHANGED',
  USER_SUSPENDED = 'USER_SUSPENDED',
  USER_BLOCKED = 'USER_BLOCKED',
  USER_REACTIVATED = 'USER_REACTIVATED',
  USER_STATUS_CHANGED = 'USER_STATUS_CHANGED',
  SYSTEM_ALERT = 'SYSTEM_ALERT'
}

export enum NotificationChannel {
  IN_APP = 'IN_APP',
  PUSH = 'PUSH',
  EMAIL = 'EMAIL'
}

export enum NotificationDeliveryStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  FAILED = 'FAILED',
  SKIPPED = 'SKIPPED'
}

export enum NotificationPriority {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export interface NotificationChannelStatus {
  channel: NotificationChannel;
  status: NotificationDeliveryStatus;
  sentAt?: any;
  error?: string;
  providerResponse?: any;
}

export interface AdminNotificationMetadata {
  actorUserId: string;
  targetUserId: string;
  sourceAction: string;
  correlationId: string;
  previousRole?: UserRole;
  nextRole?: UserRole;
  previousStatus?: UserStatus;
  nextStatus?: UserStatus;
  reason?: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  isRead: boolean;
  channels: NotificationChannel[];
  channelStatus: NotificationChannelStatus[];
  data?: Record<string, any>;
  metadata: AdminNotificationMetadata;
  createdAt: any;
  readAt?: any;
}
