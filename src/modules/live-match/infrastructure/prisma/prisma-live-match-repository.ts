import { prisma } from "@/lib/prisma";
import { ILiveMatchRepository } from "../../domain/repositories/live-match-repository";
import { LiveMatchState } from "../../domain/entities/types";

export class PrismaLiveMatchRepository implements ILiveMatchRepository {
  async getById(matchId: string): Promise<LiveMatchState | null> {
    const record = await prisma.liveMatch.findUnique({
      where: { matchId },
      include: {
        match: {
          select: {
            homeTeamId: true,
            awayTeamId: true,
          }
        }
      }
    });

    if (!record) return null;

    // Mapeia o registro do Prisma para a entidade de domínio
    return {
      id: record.id,
      matchId: record.matchId,
      status: record.status,
      currentPeriod: record.currentPeriod,
      homeScore: record.homeScore,
      awayScore: record.awayScore,
      homePenaltyScore: record.homePenaltyScore,
      awayPenaltyScore: record.awayPenaltyScore,
      currentMinute: record.currentMinute,
      currentSecond: record.currentSecond,
      lastSequenceNumber: record.lastSequenceNumber,
      version: record.version,
      homeTeamId: record.match.homeTeamId,
      awayTeamId: record.match.awayTeamId,
    };
  }

  async save(state: LiveMatchState): Promise<void> {
    await prisma.liveMatch.upsert({
      where: { matchId: state.matchId },
      update: {
        status: state.status,
        currentPeriod: state.currentPeriod,
        homeScore: state.homeScore,
        awayScore: state.awayScore,
        homePenaltyScore: state.homePenaltyScore,
        awayPenaltyScore: state.awayPenaltyScore,
        currentMinute: state.currentMinute,
        currentSecond: state.currentSecond,
        lastSequenceNumber: state.lastSequenceNumber,
        version: state.version,
      },
      create: {
        matchId: state.matchId,
        status: state.status,
        currentPeriod: state.currentPeriod,
        homeScore: state.homeScore,
        awayScore: state.awayScore,
        homePenaltyScore: state.homePenaltyScore,
        awayPenaltyScore: state.awayPenaltyScore,
        currentMinute: state.currentMinute,
        currentSecond: state.currentSecond,
        lastSequenceNumber: state.lastSequenceNumber,
        version: state.version,
      },
    });
  }

  async getInitialState(matchId: string): Promise<LiveMatchState> {
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      select: {
        homeTeamId: true,
        awayTeamId: true,
      }
    });

    if (!match) throw new Error("Match base record not found.");

    return {
      id: "", // Será preenchido pelo upsert se necessário
      matchId: matchId,
      status: 'SCHEDULED',
      currentPeriod: 'PRE_MATCH',
      homeScore: 0,
      awayScore: 0,
      homePenaltyScore: 0,
      awayPenaltyScore: 0,
      currentMinute: 0,
      currentSecond: 0,
      lastSequenceNumber: 0,
      version: 1,
      homeTeamId: match.homeTeamId,
      awayTeamId: match.awayTeamId,
    };
  }
}
