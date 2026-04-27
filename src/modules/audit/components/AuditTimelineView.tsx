import { AuditLogItem } from '../types/audit-report.types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import {
  Circle,
  Clock,
  ArrowRight,
  AlertCircle,
  UserCheck,
  ShieldAlert
} from 'lucide-react';

interface AuditTimelineViewProps {
  items: AuditLogItem[];
  onViewDetail: (item: AuditLogItem) => void;
}

export function AuditTimelineView({ items, onViewDetail }: AuditTimelineViewProps) {
  if (items.length === 0) {
    return (
      <div className="py-20 text-center border-2 border-dashed rounded-lg">
        <p className="text-muted-foreground">Nenhum evento para exibir na timeline.</p>
      </div>
    );
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return <ShieldAlert className="h-4 w-4 text-red-600" />;
      case 'HIGH': return <AlertCircle className="h-4 w-4 text-orange-500" />;
      default: return <Circle className="h-4 w-4 text-slate-400" />;
    }
  };

  return (
    <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
      {items.map((item, index) => (
        <div key={item.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
          {/* Ícone Central */}
          <div className="flex items-center justify-center w-10 h-10 rounded-full border bg-white shadow-sm z-10 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
            {getSeverityIcon(item.severity)}
          </div>

          {/* Conteúdo do Card */}
          <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer"
               onClick={() => onViewDetail(item)}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[10px]">{item.source}</Badge>
                <time className="text-xs font-mono text-muted-foreground">
                  {format(item.createdAt.toDate(), 'HH:mm:ss')}
                </time>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">#{item.correlationId.slice(0,6)}</span>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-1">
                <h4 className="font-bold text-sm text-slate-900">
                  {item.action.replace(/_/g, ' ')}
                </h4>
                <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                  <UserCheck className="h-3 w-3" />
                  <span>{item.actorName || 'Sistema'}</span>
                  <ArrowRight className="h-3 w-3 mx-1" />
                  <span>{item.targetName || 'N/A'}</span>
                </div>
              </div>
            </div>

            {item.reason && (
              <p className="mt-3 text-xs text-slate-500 italic border-l-2 border-slate-200 pl-2">
                "{item.reason}"
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
