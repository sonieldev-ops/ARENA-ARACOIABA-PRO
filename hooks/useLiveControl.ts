import { useState, useEffect, useCallback } from 'react';
import { Match, MatchStatus } from '@/types/match';
import { MatchService } from '@/lib/firebase/match-service';
import { auth } from '@/lib/firebase/client';

export function useLiveControl() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const user = auth.currentUser;

  // Carregar partidas iniciais
  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const activeMatches = await MatchService.getActiveMatches();
        setMatches(activeMatches);
      } catch (error) {
        console.error('Error fetching matches:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, []);

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

  const handleAction = useCallback(async (action: () => Promise<void>) => {
    if (actionLoading) return;
    setActionLoading(true);
    try {
      await action();
    } catch (error) {
      console.error('Action failed:', error);
      alert('Erro ao executar ação. Tente novamente.');
    } finally {
      setActionLoading(false);
    }
  }, [actionLoading]);

  const startMatch = () => {
    if (!selectedMatch || !user) return;
    handleAction(() => MatchService.startMatch(selectedMatch.id, user.uid, user.displayName || 'Admin'));
  };

  const finishMatch = () => {
    if (!selectedMatch || !user) return;
    if (!confirm('Deseja realmente encerrar a partida?')) return;
    handleAction(() => MatchService.finishMatch(selectedMatch.id, user.uid, user.displayName || 'Admin'));
  };

  const registerGoal = (teamId: string, player: { id: string, name: string }, isHome: boolean) => {
    if (!selectedMatch || !user || selectedMatch.status !== 'LIVE') return;
    handleAction(() => MatchService.registerGoal(selectedMatch.id, teamId, player, isHome, user.uid, user.displayName || 'Admin'));
  };

  const registerCard = (teamId: string, player: { id: string, name: string }, type: 'YELLOW_CARD' | 'RED_CARD') => {
    if (!selectedMatch || !user || selectedMatch.status !== 'LIVE') return;
    handleAction(() => MatchService.registerCard(selectedMatch.id, teamId, player, type, user.uid, user.displayName || 'Admin'));
  };

  const registerSubstitution = (teamId: string, playerOut: { id: string, name: string }, playerIn: { id: string, name: string }) => {
    if (!selectedMatch || !user || selectedMatch.status !== 'LIVE') return;
    handleAction(() => MatchService.registerSubstitution(selectedMatch.id, teamId, playerOut, playerIn, user.uid, user.displayName || 'Admin'));
  };

  return {
    matches,
    selectedMatch,
    setSelectedMatch,
    loading,
    actionLoading,
    startMatch,
    finishMatch,
    registerGoal,
    registerCard,
    registerSubstitution
  };
}
