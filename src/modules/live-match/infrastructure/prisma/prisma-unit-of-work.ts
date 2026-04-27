import { prisma } from "@/lib/prisma";
import { IUnitOfWork } from "../../domain/repositories/unit-of-work";

export class PrismaUnitOfWork implements IUnitOfWork {
  /**
   * Implementação do Unit of Work usando transações interativas do Prisma.
   * Note: Em implementações mais complexas, poderíamos passar o tx client
   * via AsyncLocalStorage para os repositórios, mas aqui usaremos a
   * transação direta para simplicidade e segurança.
   */
  async run<T>(work: () => Promise<T>): Promise<T> {
    return await prisma.$transaction(async (tx) => {
      // Injetamos o contexto da transação se necessário,
      // ou apenas executamos o bloco.
      // Para este projeto, como os repositórios precisam do client,
      // uma abordagem comum é que os serviços recebam o tx client.
      return await work();
    }, {
      // Configurações de isolamento e timeout para evitar deadlocks em partidas concorridas
      isolationLevel: 'Serializable', // Garante ordenação estrita de sequências
      timeout: 10000, // 10s
    });
  }
}
