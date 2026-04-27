import {
  AuditLogItem,
  AuditAction,
  AuditSeverity
} from '../types/audit-report.types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Eye, Link as LinkIcon, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AuditResultsTableProps {
  items: AuditLogItem[];
  onViewDetail: (item: AuditLogItem) => void;
  onFilterCorrelation: (correlationId: string) => void;
}

export function AuditResultsTable({
  items,
  onViewDetail,
  onFilterCorrelation
}: AuditResultsTableProps) {

  const parseDate = (date: any) => {
    if (!date) return new Date();
    if (typeof date.toDate === 'function') return date.toDate();
    if (typeof date === 'string') return parseISO(date);
    return new Date(date);
  };

  const getSeverityColor = (severity: AuditSeverity) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-red-600 hover:bg-red-700 text-white';
      case 'HIGH': return 'bg-orange-500 hover:bg-orange-600 text-white';
      case 'MEDIUM': return 'bg-yellow-500 hover:bg-yellow-600 text-white';
      case 'LOW': return 'bg-blue-500 hover:bg-blue-600 text-white';
      default: return 'bg-gray-500';
    }
  };

  const getActionLabel = (action: AuditAction) => {
    return action.replace(/_/g, ' ');
  };

  return (
    <div className="rounded-md border bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[180px]">Data/Hora</TableHead>
            <TableHead>Ação</TableHead>
            <TableHead>Operador</TableHead>
            <TableHead>Alvo</TableHead>
            <TableHead>Criticidade</TableHead>
            <TableHead>Correlation</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                Nenhum log encontrado para os filtros selecionados.
              </TableCell>
            </TableRow>
          ) : (
            items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium text-xs">
                  {format(parseDate(item.createdAt), "dd/MM/yy HH:mm:ss", { locale: ptBR })}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-semibold text-sm">{getActionLabel(item.action)}</span>
                    <span className="text-[10px] text-muted-foreground uppercase">{item.source}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-sm">{item.actorName || 'Sistema'}</span>
                    <span className="text-[10px] text-muted-foreground truncate max-w-[120px]">
                      {item.actorEmail || item.actorUserId}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  {item.targetUserId ? (
                    <div className="flex flex-col">
                      <span className="text-sm">{item.targetName || 'N/A'}</span>
                      <span className="text-[10px] text-muted-foreground truncate max-w-[120px]">
                        {item.targetEmail || item.targetUserId}
                      </span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-xs">-</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge className={getSeverityColor(item.severity)}>
                    {item.severity}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 gap-1 text-[10px]"
                    onClick={() => onFilterCorrelation(item.correlationId)}
                  >
                    <LinkIcon className="h-3 w-3" />
                    {item.correlationId.slice(0, 8)}...
                  </Button>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onViewDetail(item)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
