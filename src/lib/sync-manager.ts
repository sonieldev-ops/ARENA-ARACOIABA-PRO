'use client';

import { MatchService } from '@/lib/firebase/match-service';
import { offlineStorage, OfflineAction } from './offline-storage';
import { toast } from 'sonner';

/**
 * Gerencia a sincronização entre o armazenamento local (IndexedDB) e o Firestore.
 */
export class SyncManager {
  private static syncing = false;

  static async syncPendingActions() {
    if (this.syncing || !navigator.onLine) return;

    const pending = await offlineStorage.getPendingActions();
    if (pending.length === 0) return;

    this.syncing = true;
    console.log(`[SyncManager] Sincronizando ${pending.length} ações pendentes...`);

    // Mostra um toast discreto se houver muitos itens
    if (pending.length > 2) {
      toast.info(`Sincronizando ${pending.length} registros offline...`, { id: 'sync-status' });
    }

    for (const action of pending) {
      try {
        await this.executeAction(action);
        await offlineStorage.deleteAction(action.id);
        console.log(`[SyncManager] Ação ${action.id} (${action.type}) sincronizada.`);
      } catch (error) {
        console.error(`[SyncManager] Falha ao sincronizar ação ${action.id}:`, error);
        await offlineStorage.updateActionStatus(action.id, 'FAILED', error);
        // Se falhou por erro de rede (que detectamos no catch), paramos o loop
        if (!navigator.onLine) break;
      }
    }

    this.syncing = false;
    toast.dismiss('sync-status');
  }

  private static async executeAction(action: OfflineAction) {
    const { type, payload } = action;

    switch (type) {
      case 'START_MATCH':
        await MatchService.startMatch(payload.matchId, payload.matchName, payload.userId, payload.userName);
        break;
      case 'FINISH_MATCH':
        await MatchService.finishMatch(payload.matchId, payload.userId, payload.userName);
        break;
      case 'REGISTER_GOAL':
        await MatchService.registerGoal(
          payload.matchId,
          payload.matchName,
          payload.teamId,
          payload.player,
          payload.isHome,
          payload.userId,
          payload.userName,
          payload.userRole
        );
        break;
      case 'REGISTER_CARD':
        await MatchService.registerCard(
          payload.matchId,
          payload.matchName,
          payload.teamId,
          payload.player,
          payload.cardType,
          payload.userId,
          payload.userName,
          payload.userRole
        );
        break;
      case 'REGISTER_SUBSTITUTION':
        await MatchService.registerSubstitution(
          payload.matchId,
          payload.matchName,
          payload.teamId,
          payload.playerOut,
          payload.playerIn,
          payload.userId,
          payload.userName,
          payload.userRole
        );
        break;
      case 'PAUSE_MATCH':
        await MatchService.pauseMatch(payload.matchId, payload.userId, payload.userName, payload.userRole);
        break;
      case 'RESUME_MATCH':
        await MatchService.resumeMatch(payload.matchId, payload.userId, payload.userName, payload.userRole);
        break;
      case 'REGISTER_OBSERVATION':
        await MatchService.registerObservation(payload.matchId, payload.observation, payload.userId, payload.userName, payload.userRole);
        break;
      case 'UPDATE_PERIOD':
        await MatchService.updateMatchPeriod(payload.matchId, payload.period, payload.userId, payload.userName, payload.userRole);
        break;
      case 'UPDATE_STOPPAGE':
        await MatchService.updateStoppageTime(payload.matchId, payload.minutes, payload.userId, payload.userName, payload.userRole);
        break;
      default:
        console.warn(`[SyncManager] Tipo de ação desconhecido: ${type}`);
    }
  }
}
