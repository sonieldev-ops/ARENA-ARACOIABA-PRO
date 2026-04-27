'use client';

import { useState, useEffect, useCallback } from 'react';
import { adminDashboardService } from '../services/admin-dashboard.service';
import { AdminDashboardData } from '../types/admin-dashboard.types';

export function useAdminDashboard() {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const dashboardData = await adminDashboardService.getDashboardData();
      setData(dashboardData);
      setError(null);
    } catch (err) {
      console.error('[AdminDashboard Hook Error]:', err);
      setError('Falha ao carregar métricas administrativas');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return {
    data,
    loading,
    error,
    refresh: fetchDashboard
  };
}
