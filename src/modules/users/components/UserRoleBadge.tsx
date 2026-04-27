import { UserRole } from '@/src/types/auth';

const roleConfig: Record<UserRole, { label: string; className: string }> = {
  [UserRole.SUPER_ADMIN]: { label: 'SUPER ADMIN', className: 'bg-rose-600 text-white border-rose-500 shadow-[0_0_15px_rgba(225,29,72,0.3)]' },
  [UserRole.ADMIN]: { label: 'ADMINISTRADOR', className: 'bg-blue-600 text-white border-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.3)]' },
  [UserRole.ORGANIZER]: { label: 'ORGANIZADOR', className: 'bg-zinc-800 text-zinc-300 border-zinc-700' },
  [UserRole.REFEREE]: { label: 'ÁRBITRO', className: 'bg-zinc-800 text-zinc-300 border-zinc-700' },
  [UserRole.STAFF]: { label: 'STAFF', className: 'bg-zinc-800 text-zinc-400 border-zinc-800' },
  [UserRole.TEAM_MANAGER]: { label: 'GESTOR TIME', className: 'bg-emerald-600 text-white border-emerald-500' },
  [UserRole.ATHLETE]: { label: 'ATLETA', className: 'bg-zinc-900 text-zinc-500 border-zinc-800' },
  [UserRole.PUBLIC_USER]: { label: 'TORCEDOR', className: 'bg-zinc-900 text-zinc-600 border-zinc-900' },
};

export function UserRoleBadge({ role }: { role: UserRole }) {
  const config = roleConfig[role] || { label: role, className: 'bg-zinc-900 text-zinc-500' };

  return (
    <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-wider border whitespace-nowrap ${config.className}`}>
      {config.label}
    </span>
  );
}
