import { UserProfile, UserStatus } from '@/src/types/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Shield, UserCheck, AlertOctagon, Info } from 'lucide-react';

export function UserAccessCard({ user }: { user: UserProfile }) {
  const formatDate = (date: any) => {
    if (!date) return 'Nunca';
    const d = date?.toDate?.() || new Date(date);
    return format(d, "dd/MM/yyyy HH:mm", { locale: ptBR });
  };

  return (
    <Card className="h-full border-slate-200">
      <CardHeader className="bg-slate-50/50 border-b pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Shield className="h-5 w-5 text-indigo-600" />
          Governança e Acesso
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 grid gap-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Aprovação</p>
            <div className="flex items-center gap-2">
              {user.isApproved ? (
                <span className="flex items-center gap-1 text-sm font-semibold text-green-600">
                  <UserCheck className="h-4 w-4" /> Aprovado
                </span>
              ) : (
                <span className="flex items-center gap-1 text-sm font-semibold text-amber-600">
                  <Info className="h-4 w-4" /> Pendente
                </span>
              )}
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Solicitado</p>
            <p className="text-sm font-medium text-slate-700">{user.requestedRole || 'Nenhum'}</p>
          </div>
        </div>

        <div className="space-y-3 pt-4 border-t border-slate-100">
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-500">Última alteração de papel</span>
            <span className="text-slate-700 font-medium">{formatDate(user.lastRoleChangeAt)}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-500">Alterado por</span>
            <span className="text-slate-700 font-medium">{user.lastRoleChangeBy || 'Sistema'}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-500">Última aprovação</span>
            <span className="text-slate-700 font-medium">{formatDate(user.lastApprovalAt)}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-500">Aprovado por</span>
            <span className="text-slate-700 font-medium">{user.lastApprovalBy || 'N/A'}</span>
          </div>
        </div>

        {(user.status === UserStatus.BLOCKED || user.status === UserStatus.SUSPENDED) && (
          <div className="mt-2 p-3 bg-red-50 border border-red-100 rounded-lg flex gap-3">
            <AlertOctagon className="h-5 w-5 text-red-600 shrink-0" />
            <div className="space-y-1">
              <p className="text-sm font-bold text-red-700">Restrição Ativa</p>
              <p className="text-xs text-red-600 leading-relaxed">
                {user.blockedReason || user.suspensionReason || 'Motivo não especificado.'}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
