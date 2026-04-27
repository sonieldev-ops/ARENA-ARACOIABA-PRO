import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  CheckCircle2,
  XCircle,
  ShieldAlert,
  UserPlus,
  Settings,
  ArrowRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AuditLog {
  id: string;
  action: string;
  actorUserId: string;
  targetUserId: string;
  before: any;
  after: any;
  reason?: string;
  createdAt: any;
  source: string;
}

interface AuditTimelineProps {
  logs: AuditLog[];
}

const actionIcons: Record<string, any> = {
  USER_APPROVED: <CheckCircle2 className="h-4 w-4 text-green-500" />,
  USER_REJECTED: <XCircle className="h-4 w-4 text-red-500" />,
  USER_ACCESS_CHANGED: <Settings className="h-4 w-4 text-blue-500" />,
  USER_CREATED: <UserPlus className="h-4 w-4 text-slate-500" />,
  USER_BLOCKED: <ShieldAlert className="h-4 w-4 text-red-600" />,
};

const actionLabels: Record<string, string> = {
  USER_APPROVED: 'Usuário Aprovado',
  USER_REJECTED: 'Solicitação Rejeitada',
  USER_ACCESS_CHANGED: 'Alteração de Acesso',
  USER_CREATED: 'Usuário Criado',
  USER_BLOCKED: 'Usuário Bloqueio',
};

export function AuditTimeline({ logs }: AuditTimelineProps) {
  if (logs.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Nenhum registro de auditoria encontrado.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {logs.map((log) => (
        <div key={log.id} className="relative pl-8 pb-8 last:pb-0">
          {/* Linha vertical */}
          <div className="absolute left-3 top-0 bottom-0 w-px bg-slate-200 last:hidden" />

          {/* Ícone */}
          <div className="absolute left-0 top-1 p-1 bg-white border rounded-full">
            {actionIcons[log.action] || <Settings className="h-4 w-4 text-slate-400" />}
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sm">
                {actionLabels[log.action] || log.action}
              </span>
              <span className="text-xs text-muted-foreground">
                {log.createdAt?.toDate ? format(log.createdAt.toDate(), "dd/MM/yyyy HH:mm", { locale: ptBR }) : 'Recent'}
              </span>
            </div>

            <p className="text-xs text-muted-foreground">
              Executado por ID: <code className="bg-slate-100 px-1 rounded">{log.actorUserId}</code>
            </p>

            {log.reason && (
              <p className="text-sm mt-1 p-2 bg-amber-50 text-amber-900 rounded border border-amber-100 italic">
                "{log.reason}"
              </p>
            )}

            <div className="mt-2 text-xs space-y-1">
               {/* Exemplo simples de diffing visual */}
               {log.after.role !== log.before.role && (
                 <div className="flex items-center gap-2">
                   <span className="text-muted-foreground line-through">{log.before.role}</span>
                   <ArrowRight className="h-3 w-3" />
                   <span className="font-medium text-blue-600">{log.after.role}</span>
                 </div>
               )}
               {log.after.status !== log.before.status && (
                 <div className="flex items-center gap-2">
                   <span className="text-muted-foreground line-through">{log.before.status}</span>
                   <ArrowRight className="h-3 w-3" />
                   <span className="font-medium text-orange-600">{log.after.status}</span>
                 </div>
               )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
