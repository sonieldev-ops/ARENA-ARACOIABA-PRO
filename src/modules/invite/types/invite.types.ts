import { Timestamp } from 'firebase/firestore';

export type InviteStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';

export interface InviteDetails {
  id: string;
  teamId: string;
  teamName: string;
  invitedEmail: string;
  role: string;
  status: InviteStatus;
  createdAt: Timestamp;
  expiresAt?: Timestamp;
}

export interface AcceptInviteResponse {
  success: boolean;
  message: string;
  teamId?: string;
}
