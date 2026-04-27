import { useState, useEffect, useCallback } from 'react';
import { governanceService } from '../services/governance-dashboard.service';
import { GovernanceSummary, GovernanceFilterState } from '../types/governance.types';
import { toast } from 'sonner';

export function useGovernanceDashboard(initialFilters: Partial<GovernanceFilterState> = {}) {
  const [data, setData] = useState<GovernanceSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<GovernanceFilterState>({
    period: '7d',
    ...initialFilters
  });

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const summary = await governanceService.getSummary(filters);
      setData(summary);
      setError(null);
    } catch (err: any) {
      console.error('Erro ao carregar dashboard de governança:', err);
      setError('Falha ao carregar métricas de governança.');
      toast.error('Erro ao atualizar dashboard');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleRefresh = () => fetchDashboardData();

  return {
    data,
    loading,
    error,
    filters,
    setFilters,
    refresh: handleRefresh
  };
}
