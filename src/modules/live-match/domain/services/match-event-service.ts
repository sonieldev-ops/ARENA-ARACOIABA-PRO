import { MatchEventType, MatchEventState } from "@prisma/client";
import { ILiveMatchRepository } from "../repositories/live-match-repository";
import { IMatchEventRepository } from "../repositories/match-event-repository";
import { IOutboxRepository } from "../repositories/outbox-repository";
import { IUnitOfWork } from "../repositories/unit-of-work";
import { matchReducer } from "../reducers/match-reducer";
import {
  DuplicateEventError,
  InvalidSequenceError,
  MatchNotLiveError
} from "../errors/domain-errors";
import { MatchEvent } from "../entities/types";

export interface RegisterEventCommand {
  matchId: string;
  type: MatchEventType;
  minute: number;
  second: number;
  period: any; // MatchPeriod
  teamId?: string;
  athleteId?: string;
  relatedAthleteId?: string;
  actorUserId: string;
  payload?: any;
  correlationId?: string;
  idempotencyKey?: string;
}

export class MatchEventService {
  constructor(
    private eventRepo: IMatchEventRepository,
    private matchRepo: ILiveMatchRepository,
    private outboxRepo: IOutboxRepository,
    private unitOfWork: IUnitOfWork
  ) {}

  /**
   * Registra um novo evento na partida de forma transacional e idempotente.
   */
  async registerEvent(command: RegisterEventCommand): Promise<MatchEvent> {
    return this.unitOfWork.run(async () => {
      // 1. Validação de Idempotência
      if (command.correlationId) {
        const exists = await this.eventRepo.existsByCorrelationId(command.correlationId);
        if (exists) throw new DuplicateEventError();
      }

      if (command.idempotencyKey) {
        const exists = await this.eventRepo.existsByIdempotencyKey(command.idempotencyKey);
        if (exists) throw new DuplicateEventError();
      }

      // 2. Busca o estado atual da live
      const currentState = await this.matchRepo.getById(command.matchId);
      if (!currentState) {
        throw new MatchNotLiveError();
      }

      // 3. Validação de Sequência (Prevenção de concorrência/buracos)
      const lastSequence = await this.eventRepo.getLastSequence(command.matchId);
      const nextSequence = lastSequence + 1;

      // 4. Criação da Entidade de Evento
      const event: MatchEvent = {
        id: crypto.randomUUID(), // Usando UUID para ID de domínio se necessário, ou deixar para o repo
        matchId: command.matchId,
        liveMatchId: currentState.id,
        type: command.type,
        state: 'CONFIRMED' as MatchEventState,
        minute: command.minute,
        second: command.second,
        period: command.period,
        teamId: command.teamId,
        athleteId: command.athleteId,
        relatedAthleteId: command.relatedAthleteId,
        actorUserId: command.actorUserId,
        payload: command.payload,
        sequenceNumber: nextSequence,
        isReverted: false,
        correlationId: command.correlationId,
        createdAt: new Date()
      };

      // 5. Evolução do Estado Agregado (Projeção)
      const updatedState = matchReducer(currentState, event);

      // 6. Persistência
      await this.eventRepo.save(event);
      await this.matchRepo.save(updatedState);

      // 7. Geração de Mensagem Outbox para Real-time
      await this.outboxRepo.save({
        matchId: command.matchId,
        eventType: 'MATCH_EVENT_CREATED',
        payload: {
          event,
          state: updatedState
        }
      });

      return event;
    });
  }
}
