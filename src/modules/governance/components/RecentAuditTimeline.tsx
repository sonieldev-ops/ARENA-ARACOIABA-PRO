import React from 'react';
import { RecentAuditItem } from '../types/governance.types';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { History, User, Shield, Info, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface RecentAuditTimelineProps {
  logs: RecentAuditItem[];
  loading?: boolean;
}

export function RecentAuditTimeline({ logs, loading }: RecentAuditTimelineProps) {
  if (loading) {
    return <div className="h-64 bg-slate-50 animate-pulse rounded-xl border"></div>;
  }

  const getActionColor = (action: string) => {
    if (action.includes('APPROVE')) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (action.includes('REJECT')) return 'bg-red-50 text-red-700 border-red-200';
    if (action.includes('BLOCK')) return 'bg-slate-900 text-white';
    if (action.includes('CHANGE')) return 'bg-blue-50 text-blue-700 border-blue-200';
    return 'bg-slate-50 text-slate-700 border-slate-200';
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
      <div className="p-4 border-b bg-slate-50/50 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
          <History className="w-4 h-4 text-blue-500" />
          Atividades Recentes de Auditoria
        </h3>
        <Link href="/admin/audit">
           <Button variant="ghost" size="sm" className="text-xs h-7">Ver Tudo</Button>
        </Link>
      </div>

      <ScrollArea className="flex-1 min-h-[400px]">
        <div className="p-4 space-y-6">
          {logs.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-sm">Nenhuma atividade recente.</div>
          ) : (
            logs.map((log, index) => (
              <div key={log.id} className="relative pl-6 pb-6 last:pb-0">
                {/* Linha vertical */}
                {index < logs.length - 1 && (
                  <div className="absolute left-[7px] top-6 bottom-0 w-[2px] bg-slate-100"></div>
                )}

                {/* Ponto indicador */}
                <div className="absolute left-0 top-1.5 w-[16px] h-[16px] rounded-full bg-white border-2 border-slate-200 flex items-center justify-center">
                   <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className={getActionColor(log.action)}>
                      {log.action}
                    </Badge>
                    <span className="text-[10px] text-slate-400">
                      {log.createdAt?.seconds ? formatDistanceToNow(new Date(log.createdAt.seconds * 1000), { addSuffix: true, locale: ptBR }) : 'Agora'}
                    </span>
                  </div>

                  <div className="text-xs text-slate-700 leading-relaxed">
                    <strong>{log.actorName}</strong> {log.action.toLowerCase().replace('_', ' ')} para <strong>{log.targetName}</strong>
                  </div>

                  {log.reason && (
                    <div className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded border border-slate-100 italic">
                      "{log.reason}"
                    </div>
                  )}

                  <div className="flex items-center gap-3 mt-2">
                    <Link href={`/admin/users/${log.targetUserId}`} className="flex items-center gap-1 text-[10px] text-blue-600 hover:underline">
                       <User className="w-3 h-3" /> Perfil do Alvo
                    </Link>
                    <span className="text-[10px] text-slate-300">|</span>
                    <span className="text-[10px] text-slate-400 font-mono">ID: {log.correlationId.slice(-8)}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
