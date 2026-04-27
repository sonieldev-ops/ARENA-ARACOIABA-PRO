import { ILiveMatchRepository } from "../repositories/live-match-repository";
import { IMatchEventRepository } from "../repositories/match-event-repository";
import { IOutboxRepository } from "../repositories/outbox-repository";
import { IUnitOfWork } from "../repositories/unit-of-work";
import { matchReducer } from "../reducers/match-reducer";
import { EventAlreadyRevertedError } from "../errors/domain-errors";

export interface RevertEventCommand {
  matchId: string;
  eventId: string;
  revertedByUserId: string;
  revertReason: string;
}

export class MatchEventReversionService {
  constructor(
    private eventRepo: IMatchEventRepository,
    private matchRepo: ILiveMatchRepository,
    private outboxRepo: IOutboxRepository,
    private unitOfWork: IUnitOfWork
  ) {}

  /**
   * Reverte um evento específico e recalcula todo o estado da partida.
   * Utiliza a estratégia de Replay para garantir consistência total.
   */
  async revertEvent(command: RevertEventCommand): Promise<void> {
    await this.unitOfWork.run(async () => {
      // 1. Busca o evento original
      const eventToRevert = await this.eventRepo.getById(command.eventId);
      if (!eventToRevert) {
        throw new Error("Evento não encontrado.");
      }

      if (eventToRevert.isReverted) {
        throw new EventAlreadyRevertedError();
      }

      // 2. Marca o evento como revertido
      const updatedEvent = {
        ...eventToRevert,
        isReverted: true,
        revertedAt: new Date(),
        revertedByUserId: command.revertedByUserId,
        revertReason: command.revertReason
      };
      await this.eventRepo.update(updatedEvent);

      // 3. Recálculo do Estado (REPLAY)
      // Buscamos a timeline completa e ordenada da partida
      const timeline = await this.eventRepo.getTimeline(command.matchId);

      // Iniciamos com o estado base (snapshot ou default inicial)
      let state = await this.matchRepo.getInitialState(command.matchId);

      // Filtramos apenas eventos NÃO revertidos e aplicamos o reducer um a um
      const activeEvents = timeline.filter(e => !e.isReverted);
      for (const event of activeEvents) {
        state = matchReducer(state, event);
      }

      // 4. Salva o novo estado projetado
      await this.matchRepo.save(state);

      // 5. Publica a correção na outbox
      await this.outboxRepo.save({
        matchId: command.matchId,
        eventType: 'MATCH_EVENT_REVERTED',
        payload: {
          revertedEventId: command.eventId,
          revertReason: command.revertReason,
          newState: state
        }
      });
    });
  }
}
