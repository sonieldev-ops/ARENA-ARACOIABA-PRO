import { LiveMatchState, MatchEvent } from "../entities/types";

export type MatchEventType = 
  | 'MATCH_STARTED' 
  | 'HALF_TIME_STARTED' 
  | 'SECOND_HALF_STARTED' 
  | 'GOAL' 
  | 'OWN_GOAL' 
  | 'PENALTY_SCORED' 
  | 'MATCH_ENDED' 
  | 'WO_DECLARED' 
  | 'STATUS_CHANGED';

/**
 * Reducer puro que projeta o novo estado da partida a partir de um evento.
 * Essencial para consistência entre timeline e estado agregado.
 */
export const matchReducer = (state: LiveMatchState, event: MatchEvent): LiveMatchState => {
  // Evolui a sequência e a versão do estado
  const newState: LiveMatchState = {
    ...state,
    lastSequenceNumber: event.sequenceNumber,
    version: state.version + 1
  };

  // Se o evento estiver revertido, o reducer não deve ser chamado para ele
  // no fluxo normal, ou deve-se passar a timeline limpa para um re-projeto.
  if (event.isReverted) return state;

  switch (event.type) {
    case 'MATCH_STARTED':
      newState.status = 'LIVE';
      newState.currentPeriod = 'FIRST_HALF';
      newState.isActive = true;
      break;

    case 'HALF_TIME_STARTED':
      newState.status = 'HALF_TIME';
      newState.currentPeriod = 'HALF_TIME';
      break;

    case 'SECOND_HALF_STARTED':
      newState.status = 'LIVE';
      newState.currentPeriod = 'SECOND_HALF';
      break;

    case 'GOAL':
      if (event.teamId === state.homeTeamId) {
        newState.homeScore += 1;
      } else if (event.teamId === state.awayTeamId) {
        newState.awayScore += 1;
      }
      break;

    case 'OWN_GOAL':
      // Gol contra: incrementa placar do adversário
      if (event.teamId === state.homeTeamId) {
        newState.awayScore += 1;
      } else if (event.teamId === state.awayTeamId) {
        newState.homeScore += 1;
      }
      break;

    case 'PENALTY_SCORED':
      if (newState.currentPeriod === 'PENALTY_SHOOTOUT') {
        if (event.teamId === state.homeTeamId) {
          newState.homePenaltyScore = (newState.homePenaltyScore || 0) + 1;
        } else {
          newState.awayPenaltyScore = (newState.awayPenaltyScore || 0) + 1;
        }
      } else {
        // Gol de pênalti em tempo normal
        if (event.teamId === state.homeTeamId) {
          newState.homeScore += 1;
        } else {
          newState.awayScore += 1;
        }
      }
      break;

    case 'MATCH_ENDED':
      newState.status = 'FINISHED';
      newState.isActive = false;
      break;

    case 'WO_DECLARED':
      newState.status = 'WO';
      newState.isActive = false;
      // Regra padrão de WO: 3x0 para o time que não deu WO
      if (event.teamId === state.homeTeamId) {
        // Mandante deu WO -> 0x3
        newState.homeScore = 0;
        newState.awayScore = 3;
      } else {
        // Visitante deu WO -> 3x0
        newState.homeScore = 3;
        newState.awayScore = 0;
      }
      break;

    case 'STATUS_CHANGED':
      if (event.payload?.status) {
        newState.status = event.payload.status;
      }
      break;

    // Outros eventos como cartões não alteram o estado agregado do placar/status
    // mas podem ser processados se houver contadores no LiveMatchState futuramente.
    default:
      break;
  }

  return newState;
};
