import { MatchEvent } from "../entities/types";

export interface IMatchEventRepository {
  save(event: MatchEvent): Promise<void>;
  update(event: MatchEvent): Promise<void>;
  getById(eventId: string): Promise<MatchEvent | null>;
  getLastSequence(matchId: string): Promise<number>;
  getTimeline(matchId: string): Promise<MatchEvent[]>;
  existsByCorrelationId(correlationId: string): Promise<boolean>;
  existsByIdempotencyKey(key: string): Promise<boolean>;
}
