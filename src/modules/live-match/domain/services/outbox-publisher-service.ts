import { IOutboxRepository, OutboxMessage } from "../repositories/outbox-repository";

export interface IRealtimeProvider {
  /**
   * Envia a mensagem para o serviço de real-time (ex: Pusher, Socket.io, Ably).
   */
  broadcast(matchId: string, event: string, payload: any): Promise<void>;
}

export class OutboxPublisherService {
  constructor(
    private outboxRepo: IOutboxRepository,
    private realtimeProvider: IRealtimeProvider
  ) {}

  /**
   * Processa as mensagens pendentes na outbox.
   * Pode ser chamado por um Cron Job ou worker em background.
   */
  async publishPending(limit: number = 20): Promise<void> {
    const messages = await this.outboxRepo.findPending(limit);

    for (const msg of messages) {
      try {
        // Marca como processando ou simplesmente tenta enviar
        // (Dependendo da estratégia de bloqueio do repositório)

        await this.realtimeProvider.broadcast(
          msg.matchId,
          msg.eventType,
          msg.payload
        );

        // Sucesso: marca como publicado
        await this.outboxRepo.update({
          ...msg,
          status: 'PUBLISHED',
          processedAt: new Date()
        });

      } catch (error: any) {
        // Erro: incrementa tentativas e registra o erro
        const newAttempts = msg.attempts + 1;
        const status = newAttempts >= 5 ? 'FAILED' : 'PENDING';

        await this.outboxRepo.update({
          ...msg,
          status: status,
          attempts: newAttempts,
          lastError: error.message || String(error)
        });

        // Se falhou definitivamente, mover para Dead Letter logicamente ou emitir alerta
        if (status === 'FAILED') {
          console.error(`[Outbox] Mensagem ${msg.id} falhou definitivamente: ${error.message}`);
        }
      }
    }
  }
}
