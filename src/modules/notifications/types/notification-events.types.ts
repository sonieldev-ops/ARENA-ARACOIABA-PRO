import { NotificationType } from './notification.types';
import { UserRole, UserStatus } from '@/src/types/auth';

export interface AdminNotificationEvent {
  targetUid: string;
  type: NotificationType;
  actorUid: string;
  correlationId: string;
  data: {
    previousRole?: UserRole;
    nextRole?: UserRole;
    previousStatus?: UserStatus;
    nextStatus?: UserStatus;
    reason?: string;
  };
}
