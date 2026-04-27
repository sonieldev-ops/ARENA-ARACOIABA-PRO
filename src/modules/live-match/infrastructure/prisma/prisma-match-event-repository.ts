import { prisma } from "@/lib/prisma";
import { IMatchEventRepository } from "../../domain/repositories/match-event-repository";
import { MatchEvent } from "../../domain/entities/types";

export class PrismaMatchEventRepository implements IMatchEventRepository {
  async save(event: MatchEvent): Promise<void> {
    await prisma.matchEvent.create({
      data: {
        id: event.id,
        matchId: event.matchId,
        liveMatchId: event.liveMatchId,
        type: event.type,
        state: event.state,
        minute: event.minute,
        second: event.second,
        period: event.period,
        teamId: event.teamId,
        athleteId: event.athleteId,
        relatedAthleteId: event.relatedAthleteId,
        actorUserId: event.actorUserId,
        payload: event.payload,
        sequenceNumber: event.sequenceNumber,
        isReverted: event.isReverted,
        correlationId: event.correlationId,
        createdAt: event.createdAt,
      },
    });
  }

  async update(event: MatchEvent): Promise<void> {
    await prisma.matchEvent.update({
      where: { id: event.id },
      data: {
        state: event.state,
        isReverted: event.isReverted,
        // @ts-ignore - Reverted fields are in schema but may need proper mapping
        revertedAt: (event as any).revertedAt,
        revertedByUserId: (event as any).revertedByUserId,
        revertReason: (event as any).revertReason,
      },
    });
  }

  async getById(eventId: string): Promise<MatchEvent | null> {
    const record = await prisma.matchEvent.findUnique({
      where: { id: eventId },
    });
    if (!record) return null;
    return record as unknown as MatchEvent;
  }

  async getLastSequence(matchId: string): Promise<number> {
    const lastEvent = await prisma.matchEvent.findFirst({
      where: { matchId },
      orderBy: { sequenceNumber: 'desc' },
      select: { sequenceNumber: true },
    });
    return lastEvent?.sequenceNumber ?? 0;
  }

  async getTimeline(matchId: string): Promise<MatchEvent[]> {
    const records = await prisma.matchEvent.findMany({
      where: { matchId },
      orderBy: { sequenceNumber: 'asc' },
    });
    return records as unknown as MatchEvent[];
  }

  async existsByCorrelationId(correlationId: string): Promise<boolean> {
    const count = await prisma.matchEvent.count({
      where: { correlationId },
    });
    return count > 0;
  }

  async existsByIdempotencyKey(key: string): Promise<boolean> {
    const count = await prisma.matchEvent.count({
      where: { idempotencyKey: key },
    });
    return count > 0;
  }
}
