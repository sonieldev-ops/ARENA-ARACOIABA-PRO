import { UserStatus } from '@/src/types/auth';
import { Badge } from '@/components/ui/badge';

const statusConfig: Record<UserStatus, { label: string; className: string }> = {
  [UserStatus.PENDING_APPROVAL]: { label: 'Pendente', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  [UserStatus.ACTIVE]: { label: 'Ativo', className: 'bg-green-100 text-green-800 border-green-200' },
  [UserStatus.SUSPENDED]: { label: 'Suspenso', className: 'bg-orange-100 text-orange-800 border-orange-200' },
  [UserStatus.BLOCKED]: { label: 'Bloqueado', className: 'bg-red-100 text-red-800 border-red-200' },
  [UserStatus.REJECTED]: { label: 'Rejeitado', className: 'bg-gray-100 text-gray-800 border-gray-200' },
  [UserStatus.DEACTIVATED]: { label: 'Desativado', className: 'bg-slate-100 text-slate-800 border-slate-200' },
};

export function UserStatusBadge({ status }: { status: UserStatus }) {
  const config = statusConfig[status] || { label: status, className: '' };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.className}`}>
      {config.label}
    </span>
  );
}
