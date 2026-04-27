import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription
} from '@/components/ui/sheet';
import { AuditLogItem } from '../types/audit-report.types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { AuditBeforeAfterView } from './AuditBeforeAfterView';
import { Button } from '@/components/ui/button';
import { Link as LinkIcon, User, Shield, Info } from 'lucide-react';

interface AuditEventDrawerProps {
  event: AuditLogItem | null;
  isOpen: boolean;
  onClose: () => void;
  onFilterCorrelation: (id: string) => void;
}

export function AuditEventDrawer({
  event,
  isOpen,
  onClose,
  onFilterCorrelation
}: AuditEventDrawerProps) {
  if (!event) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-[700px] overflow-y-auto">
        <SheetHeader className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline">{event.source}</Badge>
            <Badge variant="secondary" className="font-mono text-[10px]">{event.id}</Badge>
          </div>
          <SheetTitle className="text-2xl font-bold">
            {event.action.replace(/_/g, ' ')}
          </SheetTitle>
          <SheetDescription>
            Executado em {format(event.createdAt.toDate(), "PPPP 'às' HH:mm:ss", { locale: ptBR })}
          </SheetDescription>
        </SheetHeader>

        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="mt-1 p-2 bg-blue-50 rounded-full">
                <Shield className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase">Operador</p>
                <p className="text-sm font-medium">{event.actorName || 'Sistema'}</p>
                <p className="text-xs text-muted-foreground">{event.actorEmail || event.actorUserId}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="mt-1 p-2 bg-purple-50 rounded-full">
                <User className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase">Alvo</p>
                <p className="text-sm font-medium">{event.targetName || 'N/A'}</p>
                <p className="text-xs text-muted-foreground">{event.targetEmail || event.targetUserId || '-'}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase">Correlation ID</p>
              <div className="flex items-center gap-2">
                <code className="text-[10px] bg-muted p-1 rounded">{event.correlationId}</code>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => onFilterCorrelation(event.correlationId)}
                >
                  <LinkIcon className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {event.reason && (
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase">Motivo / Justificativa</p>
                <p className="text-sm p-2 bg-orange-50 rounded border border-orange-100 italic">
                  "{event.reason}"
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b pb-2">
            <Info className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-bold text-sm">Mudanças Realizadas</h3>
          </div>
          <AuditBeforeAfterView before={event.before} after={event.after} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
