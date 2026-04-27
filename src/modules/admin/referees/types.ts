export type RefereeRole = 'MAIN' | 'ASSISTANT' | 'FOURTH' | 'SCORER';

export interface Referee {
  id: string;
  fullName: string;
  role: RefereeRole;
  phone: string;
  city: string;
  state: string;
  status: 'ACTIVE' | 'INACTIVE';
  gamesCount: number;
  lastMatchDate?: string;
  cpf?: string;
  pix?: string;
  matchFee?: number;
  notes?: string;
}

export const ROLE_LABELS: Record<RefereeRole, string> = {
  MAIN: 'Juiz Principal',
  ASSISTANT: 'Bandeirinha',
  FOURTH: 'Quarto Árbitro',
  SCORER: 'Mesário',
};
