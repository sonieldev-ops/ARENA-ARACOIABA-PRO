import { Button } from '@/components/ui/button';
import {
  Download,
  RefreshCw,
  Calendar,
  FileSpreadsheet,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AuditReportHeaderProps {
  onRefresh: () => void;
  startDate: Date | null;
  endDate: Date | null;
}

export function AuditReportHeader({ onRefresh, startDate, endDate }: AuditReportHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Relatórios de Auditoria</h1>
        <p className="text-muted-foreground">
          Investigação, compliance e rastreabilidade de ações administrativas.
        </p>
        {startDate && endDate && (
          <div className="flex items-center gap-2 mt-2 text-xs font-medium bg-slate-100 w-fit px-2 py-1 rounded">
            <Calendar className="h-3 w-3" />
            <span>{format(startDate, 'dd/MM/yyyy')}</span>
            <span>-</span>
            <span>{format(endDate, 'dd/MM/yyyy')}</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onRefresh}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Atualizar
        </Button>

        <Button variant="outline" size="sm" className="border-green-200 hover:bg-green-50 text-green-700">
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Exportar CSV
        </Button>

        <Button size="sm" className="bg-slate-900 hover:bg-slate-800">
          <AlertCircle className="mr-2 h-4 w-4" />
          Eventos Críticos
        </Button>
      </div>
    </div>
  );
}
