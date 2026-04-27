'use client';

import { useState } from 'react';
import { useAuditReport } from '@/src/modules/audit/hooks/useAuditReport';
import { AuditReportHeader } from '@/src/modules/audit/components/AuditReportHeader';
import { AuditSummaryCards } from '@/src/modules/audit/components/AuditSummaryCards';
import { AuditFiltersPanel } from '@/src/modules/audit/components/AuditFiltersPanel';
import { AuditResultsTable } from '@/src/modules/audit/components/AuditResultsTable';
import { AuditEventDrawer } from '@/src/modules/audit/components/AuditEventDrawer';
import { AuditLogItem } from '@/src/modules/audit/types/audit-report.types';
import { subDays, startOfDay, endOfDay } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Loader2, ChevronDown } from 'lucide-react';

export default function AuditReportPage() {
  const [selectedEvent, setSelectedEvent] = useState<AuditLogItem | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const {
    items,
    summary,
    loading,
    loadingMore,
    filters,
    hasMore,
    loadData,
    loadMore,
    updateFilters,
    resetFilters
  } = useAuditReport({
    startDate: startOfDay(subDays(new Date(), 7)),
    endDate: endOfDay(new Date()),
  });

  const handleViewDetail = (item: AuditLogItem) => {
    setSelectedEvent(item);
    setIsDrawerOpen(true);
  };

  const handleFilterCorrelation = (correlationId: string) => {
    updateFilters({ correlationId });
    setIsDrawerOpen(false);
  };

  return (
    <div className="container mx-auto py-8 space-y-8 animate-in fade-in duration-500">
      <AuditReportHeader
        onRefresh={() => loadData(true)}
        startDate={filters.startDate}
        endDate={filters.endDate}
      />

      <AuditSummaryCards
        summary={summary}
        loading={loading}
      />

      <AuditFiltersPanel
        filters={filters}
        onUpdate={updateFilters}
        onReset={resetFilters}
      />

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Logs de Auditoria</h2>
          <span className="text-xs text-muted-foreground">
            Mostrando {items.length} resultados
          </span>
        </div>

        {loading && items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 border rounded-md bg-muted/10">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-2" />
            <p className="text-sm text-muted-foreground">Carregando trilhas de auditoria...</p>
          </div>
        ) : (
          <>
            <AuditResultsTable
              items={items}
              onViewDetail={handleViewDetail}
              onFilterCorrelation={handleFilterCorrelation}
            />

            {hasMore && (
              <div className="flex justify-center pt-4">
                <Button
                  variant="outline"
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="w-full max-w-xs"
                >
                  {loadingMore ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <ChevronDown className="mr-2 h-4 w-4" />
                  )}
                  Carregar mais eventos
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      <AuditEventDrawer
        event={selectedEvent}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onFilterCorrelation={handleFilterCorrelation}
      />
    </div>
  );
}
