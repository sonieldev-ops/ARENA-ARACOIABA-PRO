import { useState, useEffect, useCallback } from 'react';
import {
  AuditLogItem,
  AuditFilterState,
  AuditSummary,
  AuditAction
} from '../types/audit-report.types';
import { auditReportService } from '../services/audit-report.service';
import { toast } from 'sonner';

export function useAuditReport(initialFilters: AuditFilterState) {
  const [items, setItems] = useState<AuditLogItem[]>([]);
  const [summary, setSummary] = useState<AuditSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [filters, setFilters] = useState<AuditFilterState>(initialFilters);
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);

  const loadData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const { items: newItems, lastVisible } = await auditReportService.listAuditLogs(
        filters,
        50
      );

      setItems(newItems);
      setLastDoc(lastVisible);
      setHasMore(newItems.length === 50);

      // Carregar resumo se houver período definido
      if (filters.startDate && filters.endDate) {
        const newSummary = await auditReportService.getAuditSummary(
          filters.startDate,
          filters.endDate
        );
        setSummary(newSummary);
      }
    } catch (error) {
      console.error('Erro ao carregar auditoria:', error);
      toast.error('Erro ao carregar dados de auditoria');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filters]);

  const loadMore = async () => {
    if (!lastDoc || loadingMore || !hasMore) return;

    try {
      setLoadingMore(true);
      const { items: moreItems, lastVisible } = await auditReportService.listAuditLogs(
        filters,
        50,
        lastDoc
      );

      setItems(prev => [...prev, ...moreItems]);
      setLastDoc(lastVisible);
      setHasMore(moreItems.length === 50);
    } catch (error) {
      console.error('Erro ao carregar mais logs:', error);
      toast.error('Erro ao carregar mais resultados');
    } finally {
      setLoadingMore(false);
    }
  };

  const updateFilters = (newFilters: Partial<AuditFilterState>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const resetFilters = () => {
    setFilters(initialFilters);
  };

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    items,
    summary,
    loading,
    loadingMore,
    refreshing,
    filters,
    hasMore,
    loadData,
    loadMore,
    updateFilters,
    resetFilters
  };
}
