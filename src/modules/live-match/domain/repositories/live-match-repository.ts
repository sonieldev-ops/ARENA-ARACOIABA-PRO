import { LiveMatchState } from "../entities/types";

export interface ILiveMatchRepository {
  getById(matchId: string): Promise<LiveMatchState | null>;
  save(state: LiveMatchState): Promise<void>;

  /**
   * Obtém o estado inicial (snapshot ou default) para reconstrução.
   */
  getInitialState(matchId: string): Promise<LiveMatchState>;
}
