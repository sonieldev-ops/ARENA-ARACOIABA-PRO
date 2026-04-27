import { sanitizeData } from '@/src/lib/utils';

export interface RankingTeam {
  id: string;
  championshipId: string;
  teamId: string;
  name: string;
  points: number;
  played: number;
  victories: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  updatedAt: any;
}

export const RankingService = {
  /**
   * Ordena a tabela de classificação seguindo critérios oficiais:
   * 1. Pontos
   * 2. Vitórias
   * 3. Saldo de Gols
   * 4. Gols Pró (GP)
   * 5. Gols Contra (GC) - Menor é melhor
   */
  sortRanking(data: any[]): RankingTeam[] {
    return [...data].sort((a, b) => {
      // 1. Pontos
      if ((b.points || 0) !== (a.points || 0)) return (b.points || 0) - (a.points || 0);

      // 2. Vitórias
      if ((b.victories || 0) !== (a.victories || 0)) return (b.victories || 0) - (a.victories || 0);

      // 3. Saldo de Gols
      if ((b.goalDifference || 0) !== (a.goalDifference || 0)) return (b.goalDifference || 0) - (a.goalDifference || 0);

      // 4. Gols Pró
      if ((b.goalsFor || 0) !== (a.goalsFor || 0)) return (b.goalsFor || 0) - (a.goalsFor || 0);

      // 5. Gols Contra (Inverso)
      return (a.goalsAgainst || 0) - (b.goalsAgainst || 0);
    });
  }
};
