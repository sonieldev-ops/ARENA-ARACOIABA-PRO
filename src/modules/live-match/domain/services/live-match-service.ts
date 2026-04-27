import { MatchLiveStatus } from "@prisma/client";
import { ILiveMatchRepository } from "../repositories/live-match-repository";
import { IOutboxRepository } from "../repositories/outbox-repository";
import { IUnitOfWork } from "../repositories/unit-of-work";
import { InvalidStatusTransitionError, MatchNotLiveError } from "../errors/domain-errors";

export class LiveMatchService {
  constructor(
    private matchRepo: ILiveMatchRepository,
    private outboxRepo: IOutboxRepository,
    private unitOfWork: IUnitOfWork
  ) {}

  /**
   * Inicia a cobertura ao vivo de uma partida.
   */
  async startLive(matchId: string, actorUserId: string): Promise<void> {
    await this.unitOfWork.run(async () => {
      const state = await this.matchRepo.getById(matchId);
      if (!state) throw new Error("Partida não encontrada.");

      if (state.status !== 'SCHEDULED' && state.status !== 'PRE_GAME') {
        throw new InvalidStatusTransitionError(state.status, 'LIVE');
      }

      state.status = 'LIVE';
      state.isActive = true;
      state.version += 1;

      await this.matchRepo.save(state);

      await this.outboxRepo.save({
        matchId,
        eventType: 'MATCH_LIVE_STARTED',
        payload: { state, actorUserId }
      });
    });
  }

  /**
   * Finaliza a partida oficialmente.
   */
  async finishMatch(matchId: string, actorUserId: string): Promise<void> {
    await this.unitOfWork.run(async () => {
      const state = await this.matchRepo.getById(matchId);
      if (!state || !state.isActive) throw new MatchNotLiveError();

      state.status = 'FINISHED';
      state.isActive = false;
      state.version += 1;

      await this.matchRepo.save(state);

      await this.outboxRepo.save({
        matchId,
        eventType: 'MATCH_LIVE_FINISHED',
        payload: { state, actorUserId }
      });
    });
  }

  /**
   * Transição genérica de status (Ex: Suspensão, Intervalo, etc).
   */
  async updateStatus(matchId: string, newStatus: MatchLiveStatus, actorUserId: string): Promise<void> {
    await this.unitOfWork.run(async () => {
      const state = await this.matchRepo.getById(matchId);
      if (!state) throw new Error("Partida não encontrada.");

      // Validação básica de transição (pode ser expandida com uma Policy)
      if (state.status === 'FINISHED' || state.status === 'CANCELED') {
        throw new InvalidStatusTransitionError(state.status, newStatus);
      }

      state.status = newStatus;
      state.version += 1;

      await this.matchRepo.save(state);

      await this.outboxRepo.save({
        matchId,
        eventType: 'MATCH_STATUS_UPDATED',
        payload: { status: newStatus, state, actorUserId }
      });
    });
  }
}
