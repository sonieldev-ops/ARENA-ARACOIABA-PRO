'use client';

import { useState, useEffect, useCallback } from 'react';
import { teamService } from '../services/team.service';
import { TeamDashboardData } from '../types/team.types';
import { auth } from '@/src/lib/firebase/client';
import { onAuthStateChanged } from 'firebase/auth';
import { toast } from 'sonner';

export function useTeamManagerDashboard() {
  const [data, setData] = useState<TeamDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTeamData = useCallback(async (uid: string) => {
    try {
      setLoading(true);
      const dashboardData = await teamService.getDashboardData(uid);
      setData(dashboardData);
    } catch (err) {
      setError('Erro ao carregar dados do time');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchTeamData(user.uid);
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [fetchTeamData]);

  // Ações
  const invitePlayer = async (email: string, role: string) => {
    if (!data?.team) return;
    try {
      await teamService.sendInvite(data.team, email, role);
      toast.success('Convite enviado com sucesso!');
      fetchTeamData(auth.currentUser!.uid);
    } catch (err) {
      toast.error('Erro ao enviar convite');
    }
  };

  const removeMember = async (userId: string) => {
    if (!data?.team) return;
    try {
      await teamService.removeMember(data.team.id, userId);
      toast.success('Membro removido');
      fetchTeamData(auth.currentUser!.uid);
    } catch (err) {
      toast.error('Erro ao remover membro');
    }
  };

  const registerInCompetition = async (competitionId: string) => {
    if (!data?.team) return;
    try {
      await teamService.registerInCompetition(data.team.id, competitionId);
      toast.success('Inscrição enviada para análise!');
      fetchTeamData(auth.currentUser!.uid);
    } catch (err) {
      toast.error('Erro na inscrição');
    }
  };

  return {
    data,
    loading,
    error,
    actions: {
      invitePlayer,
      removeMember,
      registerInCompetition,
      refresh: () => auth.currentUser && fetchTeamData(auth.currentUser.uid)
    }
  };
}
