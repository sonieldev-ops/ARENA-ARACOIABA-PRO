'use client';

import { useState, useEffect, useCallback } from 'react';
import { Referee } from '../types';
import { refereesService } from '../referees.service';
import { toast } from 'sonner';

export function useReferees() {
  const [referees, setReferees] = useState<Referee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadReferees = useCallback(async () => {
    try {
      setLoading(true);
      const data = await refereesService.getAll();
      setReferees(data);
    } catch (err: any) {
      console.error('Error loading referees:', err);
      setError(err.message);
      toast.error('Erro ao carregar árbitros');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReferees();
  }, [loadReferees]);

  const addReferee = async (data: Omit<Referee, 'id' | 'gamesCount'>) => {
    try {
      await refereesService.create(data);
      await loadReferees();
      toast.success('Árbitro cadastrado com sucesso!');
    } catch (err: any) {
      toast.error('Erro ao cadastrar árbitro');
      throw err;
    }
  };

  const updateReferee = async (id: string, data: Partial<Referee>) => {
    try {
      await refereesService.update(id, data);
      await loadReferees();
      toast.success('Dados atualizados com sucesso!');
    } catch (err: any) {
      toast.error('Erro ao atualizar árbitro');
      throw err;
    }
  };

  const deleteReferee = async (id: string) => {
    try {
      await refereesService.delete(id);
      await loadReferees();
      toast.success('Árbitro removido');
    } catch (err: any) {
      toast.error('Erro ao remover árbitro');
      throw err;
    }
  };

  const assignRefereesToMatch = async (matchId: string, assignment: any) => {
    try {
      await refereesService.assignToMatch(matchId, assignment);
      toast.success('Arbitragem escalada com sucesso!');
    } catch (err: any) {
      toast.error('Erro ao escalar arbitragem');
      throw err;
    }
  };

  return {
    referees,
    loading,
    error,
    refresh: loadReferees,
    addReferee,
    updateReferee,
    deleteReferee,
    assignRefereesToMatch
  };
}
