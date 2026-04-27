export class DomainError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
    this.name = 'DomainError';
  }
}

export class MatchNotLiveError extends DomainError {
  constructor() {
    super("A partida não está em andamento ou no estado permitido para esta ação.", "MATCH_NOT_LIVE");
  }
}

export class DuplicateEventError extends DomainError {
  constructor() {
    super("Este evento já foi processado (Idempotência detectada).", "DUPLICATE_EVENT");
  }
}

export class InvalidSequenceError extends DomainError {
  constructor(expected: number, received: number) {
    super(`Sequência de evento inválida. Esperada: ${expected}, Recebida: ${received}`, "INVALID_SEQUENCE");
  }
}

export class InvalidStatusTransitionError extends DomainError {
  constructor(from: string, to: string) {
    super(`Transição de status inválida de ${from} para ${to}.`, "INVALID_STATUS_TRANSITION");
  }
}

export class EventAlreadyRevertedError extends DomainError {
  constructor() {
    super("Este evento já foi revertido anteriormente.", "EVENT_ALREADY_REVERTED");
  }
}

export class UnauthorizedActionError extends DomainError {
  constructor(role: string) {
    super(`Perfil ${role} não tem autorização para realizar esta ação na live.`, "UNAUTHORIZED_ACTION");
  }
}
