import { AuditFilterState, AuditAction, AuditSeverity, AuditSource } from '../types/audit-report.types';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { X, Search, Filter } from 'lucide-react';

interface AuditFiltersPanelProps {
  filters: AuditFilterState;
  onUpdate: (filters: Partial<AuditFilterState>) => void;
  onReset: () => void;
}

const ACTIONS: AuditAction[] = [
  'USER_APPROVE', 'USER_REJECT', 'USER_BLOCK', 'USER_SUSPEND',
  'USER_REACTIVATE', 'ROLE_UPDATE', 'STATUS_UPDATE', 'SETTINGS_CHANGE'
];

const SEVERITIES: AuditSeverity[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const SOURCES: AuditSource[] = ['ADMIN_PANEL', 'APP_CLIENT', 'CLOUD_FUNCTION', 'SYSTEM'];

export function AuditFiltersPanel({ filters, onUpdate, onReset }: AuditFiltersPanelProps) {
  return (
    <Card className="mb-6 border-blue-100 bg-blue-50/30">
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label>ID do Operador</Label>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="UID do Operador..."
                className="pl-8 bg-white"
                value={filters.actorUserId || ''}
                onChange={(e) => onUpdate({ actorUserId: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>ID do Alvo</Label>
            <Input
              placeholder="UID do Usuário Alvo..."
              className="bg-white"
              value={filters.targetUserId || ''}
              onChange={(e) => onUpdate({ targetUserId: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Ação</Label>
            <Select
              value={filters.action || 'ALL'}
              onValueChange={(val) => onUpdate({ action: val === 'ALL' ? undefined : val as AuditAction })}
            >
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Todas as ações" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todas as ações</SelectItem>
                {ACTIONS.map(action => (
                  <SelectItem key={action} value={action}>{action.replace(/_/g, ' ')}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Severidade</Label>
            <Select
              value={filters.severity || 'ALL'}
              onValueChange={(val) => onUpdate({ severity: val === 'ALL' ? undefined : val as AuditSeverity })}
            >
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Todas as severidades" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todas</SelectItem>
                {SEVERITIES.map(s => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Correlation ID</Label>
            <Input
              placeholder="Buscar por Correlation ID..."
              className="bg-white"
              value={filters.correlationId || ''}
              onChange={(e) => onUpdate({ correlationId: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Fonte (Source)</Label>
            <Select
              value={filters.source || 'ALL'}
              onValueChange={(val) => onUpdate({ source: val === 'ALL' ? undefined : val as AuditSource })}
            >
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Todas as fontes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todas</SelectItem>
                {SOURCES.map(s => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="md:col-span-2 lg:col-span-2 flex items-end gap-2">
            <Button
              variant="outline"
              className="flex-1 bg-white"
              onClick={onReset}
            >
              <X className="mr-2 h-4 w-4" />
              Limpar Filtros
            </Button>
            <Button className="flex-[2]">
              <Filter className="mr-2 h-4 w-4" />
              Aplicar Filtros Avançados
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
