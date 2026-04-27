export interface IUnitOfWork {
  /**
   * Executa um bloco de código dentro de uma transação ACID.
   */
  run<T>(work: () => Promise<T>): Promise<T>;
}
