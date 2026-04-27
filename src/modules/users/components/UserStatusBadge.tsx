import { UserStatus } from '@/src/types/auth';

const statusConfig: Record<UserStatus, { label: string; className: string }> = {
  [UserStatus.PENDING_APPROVAL]: { label: 'PENDENTE', className: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
  [UserStatus.ACTIVE]: { label: 'ATIVO', className: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]' },
  [UserStatus.SUSPENDED]: { label: 'SUSPENSO', className: 'bg-orange-500/10 text-orange-500 border-orange-500/20' },
  [UserStatus.BLOCKED]: { label: 'BLOQUEADO', className: 'bg-rose-500/10 text-rose-500 border-rose-500/20 shadow-[0_0_10px_rgba(244,63,94,0.1)]' },
  [UserStatus.REJECTED]: { label: 'REJEITADO', className: 'bg-zinc-800 text-zinc-500 border-zinc-700' },
  [UserStatus.DEACTIVATED]: { label: 'DESATIVADO', className: 'bg-zinc-900 text-zinc-600 border-zinc-800' },
};

export function UserStatusBadge({ status }: { status: UserStatus }) {
  const config = statusConfig[status] || { label: status, className: '' };

  return (
    <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${config.className}`}>
      {config.label}
    </span>
  );
}
