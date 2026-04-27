import { AdminAuditLog } from '../types/user-detail.types';
import { UserAuditEventCard } from './UserAuditEventCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { History, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface UserAuditTimelineProps {
  logs: AdminAuditLog[];
  loading: boolean;
}

export function UserAuditTimeline({ logs, loading }: UserAuditTimelineProps) {
  return (
    <Card className="border-slate-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b">
        <CardTitle className="text-lg flex items-center gap-2">
          <History className="h-5 w-5 text-slate-400" />
          Histórico de Auditoria
        </CardTitle>
        <div className="relative w-64">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Filtrar eventos..."
            className="pl-9 h-9 text-sm"
          />
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 w-full bg-slate-50 animate-pulse rounded-lg border border-slate-100" />
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            Nenhum evento registrado para este usuário.
          </div>
        ) : (
          <div className="relative space-y-6 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
            {logs.map((log) => (
              <UserAuditEventCard key={log.id} log={log} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
