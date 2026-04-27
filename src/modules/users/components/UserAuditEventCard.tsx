import { AdminAuditLog } from '../types/user-detail.types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  UserPlus,
  UserCheck,
  UserX,
  ShieldAlert,
  RefreshCw,
  Clock,
  ChevronDown
} from 'lucide-react';
import { useState } from 'react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const actionConfig: Record<string, { label: string; icon: any; color: string; bgColor: string }> = {
  'USER_APPROVED': { label: 'Aprovação', icon: UserCheck, color: 'text-green-600', bgColor: 'bg-green-100' },
  'USER_REJECTED': { label: 'Rejeição', icon: UserX, color: 'text-red-600', bgColor: 'bg-red-100' },
  'USER_ACCESS_CHANGED': { label: 'Mudança de Acesso', icon: ShieldAlert, color: 'text-amber-600', bgColor: 'bg-amber-100' },
  'SIGNUP': { label: 'Cadastro', icon: UserPlus, color: 'text-blue-600', bgColor: 'bg-blue-100' },
  'DEFAULT': { label: 'Ação do Sistema', icon: RefreshCw, color: 'text-slate-600', bgColor: 'bg-slate-100' },
};

export function UserAuditEventCard({ log }: { log: AdminAuditLog }) {
  const [isOpen, setIsOpen] = useState(false);
  const config = actionConfig[log.action] || actionConfig['DEFAULT'];
  const Icon = config.icon;

  const formatDate = (date: any) => {
    const d = date?.toDate?.() || new Date(date);
    return format(d, "dd/MM/yyyy HH:mm:ss", { locale: ptBR });
  };

  // Helper para renderizar diffs simples
  const renderDiff = () => {
    if (!log.before || !log.after) return null;

    const changes: string[] = [];
    Object.keys(log.after).forEach(key => {
      if (log.before[key] !== log.after[key] && typeof log.after[key] !== 'object') {
        changes.push(`${key}: ${log.before[key]} -> ${log.after[key]}`);
      }
    });

    if (changes.length === 0) return null;

    return (
      <div className="mt-2 p-2 bg-slate-900 rounded text-[10px] font-mono text-slate-300 space-y-1">
        {changes.map((c, i) => <div key={i}>{c}</div>)}
      </div>
    );
  };

  return (
    <div className="relative pl-12">
      <div className={`absolute left-0 top-0 p-2 rounded-full border-4 border-white z-10 ${config.bgColor}`}>
        <Icon className={`h-4 w-4 ${config.color}`} />
      </div>

      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
        <div className="bg-white border rounded-xl p-4 shadow-sm hover:border-slate-300 transition-colors">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold uppercase tracking-tight ${config.color}`}>
                  {config.label}
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {formatDate(log.createdAt)}
                </span>
              </div>

              <p className="text-sm font-medium text-slate-700">
                {log.action === 'SIGNUP' ? 'Usuário realizou o cadastro inicial' : `Ação executada por ${log.actorUserId}`}
              </p>

              {log.reason && (
                <p className="text-xs text-slate-500 italic bg-slate-50 p-2 rounded border-l-2 border-slate-200">
                  "{log.reason}"
                </p>
              )}
            </div>

            <CollapsibleTrigger asChild>
              <button className="p-1 hover:bg-slate-50 rounded">
                <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </button>
            </CollapsibleTrigger>
          </div>

          <CollapsibleContent className="mt-4 pt-4 border-t border-slate-50">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Origem</p>
                <p className="text-xs text-slate-600">{log.source || 'Não especificada'}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">ID de Correlação</p>
                <p className="text-xs text-slate-600 font-mono">{log.correlationId || 'N/A'}</p>
              </div>
            </div>

            {renderDiff()}

            <div className="mt-3">
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Raw JSON (Admin Only)</p>
              <pre className="text-[9px] bg-slate-50 p-2 rounded overflow-auto max-h-32 text-slate-500">
                {JSON.stringify({ before: log.before, after: log.after }, null, 2)}
              </pre>
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>
    </div>
  );
}
