import { OutboxStatus } from "@prisma/client";

export interface OutboxMessage {
  id: string;
  matchId: string;
  eventType: string;
  payload: any;
  status: OutboxStatus;
  attempts: number;
  lastError?: string | null;
  createdAt: Date;
  processedAt?: Date | null;
}

export interface IOutboxRepository {
  save(message: Omit<OutboxMessage, 'id' | 'status' | 'attempts' | 'createdAt'>): Promise<void>;
  findPending(limit: number): Promise<OutboxMessage[]>;
  update(message: OutboxMessage): Promise<void>;
}
