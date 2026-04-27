import { useState, useEffect, useCallback } from 'react';
import { Match, MatchStatus } from '@/src/types/match';
import { MatchService } from '@/lib/firebase/match-service';
import { auth } from '@/lib/firebase/client';
import { authService } from '@/src/modules/auth/services/auth.service';
import { toast } from 'sonner';
import { offlineStorage } from '@/src/lib/offline-storage';
import { SyncManager } from '@/src/lib/sync-manager';

export function useLiveControl() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isOnline, setIsOnline] = useState(true);

  const user = auth.currentUser;

  // 1. Detectar Conectividade
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = () => {
      setIsOnline(true);
      toast.success("Conexão restabelecida. Sincronizando dados...");
      SyncManager.syncPendingActions();
    };
    const handleOffline = () => {
      setIsOnline(false);
      toast.warning("Você está offline. O sistema salvará as ações localmente.");
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    setIsOnline(navigator.onLine);

    // Tentar sincronizar ao carregar o hook se estiver online
    if (navigator.onLine) {
      SyncManager.syncPendingActions();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Carregar partidas iniciais
  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const activeMatches = await MatchService.getActiveMatches();

        // Regra de Negócio Premium: Filtro por Árbitro
        // Admin vê tudo, Árbitro vê apenas as suas
        const profile = await authService.getCurrentUser();
        setUserProfile(profile);

        if (profile?.role === 'REFEREE') {
           setMatches(activeMatches.filter(m => (m as any).refereeId === profile.uid));
        } else {
           setMatches(activeMatches);
        }
      } catch (error) {
        console.error('Error fetching matches:', error);
        // Se falhar por estar offline, tentamos manter o que tiver no estado ou cache do Firebase
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, [user?.uid]);

  // Subscrever a mudanças na partida selecionada
  useEffect(() => {
    if (!selectedMatch?.id) return;

    const unsubscribe = MatchService.subscribeToMatch(selectedMatch.id, (updatedMatch) => {
      setSelectedMatch(updatedMatch);
      // Atualizar também na lista
      setMatches(prev => prev.map(m => m.id === updatedMatch.id ? updatedMatch : m));
    });

    return () => unsubscribe();
  }, [selectedMatch?.id]);

  const queueAndExecute = async (type: string, payload: any, actionFn: () => Promise<void>) => {
    const actionId = `${Date.now()}_${user?.uid}`;

    // 1. Salvar no IndexedDB primeiro
    await offlineStorage.saveAction({
      id: actionId,
      matchId: selectedMatch!.id,
      type,
      payload: {
        ...payload,
        userId: user?.uid,
        userName: user?.displayName || 'Árbitro',
        userRole: userProfile?.role
      },
      timestamp: Date.now(),
    });

    // 2. Se online, tentar executar no Firestore
    if (navigator.onLine) {
      try {
        await actionFn();
        // Se sucesso, remover do IndexedDB
        await offlineStorage.deleteAction(actionId);
      } catch (error) {
        console.error(`[Offline] Falha ao executar ação ${type} online, ficará pendente.`, error);
      }
    } else {
      console.log(`[Offline] Ação ${type} salva localmente (Offline).`);
    }
  };

  const handleAction = useCallback(async (
    type: string,
    payload: any,
    actionFn: () => Promise<void>,
    successMessage?: string
  ) => {
    if (actionLoading) return;
    setActionLoading(true);
    try {
      await queueAndExecute(type, payload, actionFn);
      if (successMessage) {
        toast.success(successMessage);
      }
    } catch (error) {
      console.error('Action failed:', error);
      toast.error('Erro ao processar ação. O registro foi salvo localmente.');
    } finally {
      setActionLoading(false);
    }
  }, [actionLoading, selectedMatch, user]);

  const startMatch = () => {
    if (!selectedMatch || !user) return;
    handleAction(
      'START_MATCH',
      { matchId: selectedMatch.id, matchName: `${selectedMatch.teamAName} vs ${selectedMatch.teamBName}` },
      () => MatchService.startMatch(selectedMatch.id, `${selectedMatch.teamAName} vs ${selectedMatch.teamBName}`, user.uid, user.displayName || 'Admin'),
      'Partida iniciada!'
    );
  };

  const finishMatch = () => {
    if (!selectedMatch || !user) return;
    handleAction(
      'FINISH_MATCH',
      { matchId: selectedMatch.id },
      () => MatchService.finishMatch(selectedMatch.id, user.uid, user.displayName || 'Admin'),
      'Partida encerrada!'
    );
  };

  const registerGoal = (teamId: string, player: { id: string, name: string }, isHome: boolean) => {
    if (!selectedMatch || !user) return;
    handleAction(
      'REGISTER_GOAL',
      { matchId: selectedMatch.id, matchName: `${selectedMatch.teamAName} vs ${selectedMatch.teamBName}`, teamId, player, isHome },
      () => MatchService.registerGoal(selectedMatch.id, `${selectedMatch.teamAName} vs ${selectedMatch.teamBName}`, teamId, player, isHome, user.uid, user.displayName || 'Admin', userProfile?.role),
      `GOL de ${player.name}!`
    );
  };

  const registerCard = (teamId: string, player: { id: string, name: string }, type: 'YELLOW_CARD' | 'RED_CARD') => {
    if (!selectedMatch || !user) return;
    handleAction(
      'REGISTER_CARD',
      { matchId: selectedMatch.id, matchName: `${selectedMatch.teamAName} vs ${selectedMatch.teamBName}`, teamId, player, cardType: type },
      () => MatchService.registerCard(selectedMatch.id, `${selectedMatch.teamAName} vs ${selectedMatch.teamBName}`, teamId, player, type, user.uid, user.displayName || 'Admin', userProfile?.role),
      `Cartão registrado!`
    );
  };

  const registerSubstitution = (teamId: string, playerOut: { id: string, name: string }, playerIn: { id: string, name: string }) => {
    if (!selectedMatch || !user) return;
    handleAction(
      'REGISTER_SUBSTITUTION',
      { matchId: selectedMatch.id, matchName: `${selectedMatch.teamAName} vs ${selectedMatch.teamBName}`, teamId, playerOut, playerIn },
      () => MatchService.registerSubstitution(selectedMatch.id, `${selectedMatch.teamAName} vs ${selectedMatch.teamBName}`, teamId, playerOut, playerIn, user.uid, user.displayName || 'Admin', userProfile?.role),
      'Substituição registrada!'
    );
  };

  const pauseMatch = () => {
    if (!selectedMatch || !user) return;
    handleAction(
      'PAUSE_MATCH',
      { matchId: selectedMatch.id },
      () => MatchService.pauseMatch(selectedMatch.id, user.uid, user.displayName || 'Admin', userProfile?.role),
      'Partida pausada!'
    );
  };

  const resumeMatch = () => {
    if (!selectedMatch || !user) return;
    handleAction(
      'RESUME_MATCH',
      { matchId: selectedMatch.id },
      () => MatchService.resumeMatch(selectedMatch.id, user.uid, user.displayName || 'Admin', userProfile?.role),
      'Partida retomada!'
    );
  };

  const registerObservation = (observation: string) => {
    if (!selectedMatch || !user) return;
    handleAction(
      'REGISTER_OBSERVATION',
      { matchId: selectedMatch.id, observation },
      () => MatchService.registerObservation(selectedMatch.id, observation, user.uid, user.displayName || 'Admin', userProfile?.role),
      'Observação registrada!'
    );
  };

  const updatePeriod = (period: '1T' | 'INTERVALO' | '2T' | 'FIM') => {
    if (!selectedMatch || !user) return;
    handleAction(
      'UPDATE_PERIOD',
      { matchId: selectedMatch.id, period },
      () => MatchService.updateMatchPeriod(selectedMatch.id, period, user.uid, user.displayName || 'Admin', userProfile?.role),
      `Período: ${period}`
    );
  };

  const updateStoppage = (minutes: number) => {
    if (!selectedMatch || !user) return;
    handleAction(
      'UPDATE_STOPPAGE',
      { matchId: selectedMatch.id, minutes },
      () => MatchService.updateStoppageTime(selectedMatch.id, minutes, user.uid, user.displayName || 'Admin', userProfile?.role),
      `Acréscimos: +${minutes} min`
    );
  };

  return {
    matches,
    selectedMatch,
    setSelectedMatch,
    loading,
    actionLoading,
    userProfile,
    isOnline,
    startMatch,
    finishMatch,
    registerGoal,
    registerCard,
    registerSubstitution,
    pauseMatch,
    resumeMatch,
    registerObservation,
    updatePeriod,
    updateStoppage
  };
}

