'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Trophy,
  Users,
  UserSquare2,
  Swords,
  Activity,
  ListOrdered,
  Goal,
  ShieldCheck,
  ClipboardList,
  Bell,
  Settings,
  LogOut,
  ChevronRight,
  DollarSign,
  X
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { Button } from '@/components/ui/button';
import { auth } from '@/src/lib/firebase/client';
import { signOut } from 'firebase/auth';
import { useAuth } from '@/src/modules/auth/context/AuthContext';

const menuItems = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/admin/dashboard' },
  { label: 'Campeonatos', icon: Trophy, href: '/admin/campeonatos' },
  { label: 'Times', icon: Users, href: '/admin/times' },
  { label: 'Atletas', icon: UserSquare2, href: '/admin/atletas' },
  { label: 'Partidas', icon: Swords, href: '/admin/partidas' },
  { label: 'Arbitragem', icon: ShieldCheck, href: '/admin/referees' },
  { label: 'Controle Ao Vivo', icon: Activity, href: '/admin/live-control' },
  { label: 'Classificação', icon: ListOrdered, href: '/admin/classificacao' },
  { label: 'Artilharia', icon: Goal, href: '/admin/artilheiros' },
  { type: 'divider', label: 'Estratégico' },
  { label: 'Financeiro', icon: DollarSign, href: '/admin/finance' },
  { label: 'Executivo', icon: Activity, href: '/admin/dashboard-executivo' },
  { type: 'divider', label: 'Gestão' },
  { label: 'Usuários', icon: Users, href: '/admin/usuarios' },
  { label: 'Aprovações', icon: ShieldCheck, href: '/admin/usuarios/pending' },
  { label: 'Governança', icon: ShieldCheck, href: '/admin/governance' },
  { label: 'Auditoria', icon: ClipboardList, href: '/admin/auditoria', superAdminOnly: true },
  { label: 'Notificações', icon: Bell, href: '/admin/notifications' },
  { label: 'Configurações', icon: Settings, href: '/admin/settings' },
];

export function AdminSidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const { user } = useAuth();

  const handleLogout = async () => {
    await signOut(auth);
    window.location.href = '/login';
  };

  return (
    <aside className="w-64 h-full bg-zinc-950 border-r border-zinc-900 flex flex-col shadow-2xl md:shadow-none">
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-3 px-2">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center font-bold text-white shadow-lg shadow-blue-900/40 transform -rotate-6">
            A
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-black text-white tracking-tighter uppercase italic leading-none">
              ARENA <span className="text-blue-500">PRO</span>
            </span>
            <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest mt-0.5">
              ARAÇOIABA - PE
            </span>
          </div>
        </div>

        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose} className="md:hidden text-zinc-500">
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-4 py-2 space-y-1 custom-scrollbar">
        {menuItems.map((item: any, index) => {
          if (item.type === 'divider') {
            return (
              <div key={index} className="pt-6 pb-2 px-4">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-600">
                  {item.label}
                </p>
              </div>
            );
          }

          if (item.superAdminOnly && user?.role !== 'SUPER_ADMIN') {
            return null;
          }

          const isActive = pathname === item.href || (item.href !== '/admin' && pathname?.startsWith(item.href!));
          const Icon = item.icon!;

          return (
            <Link
              key={item.href}
              href={item.href!}
              className={cn(
                "flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 group",
                isActive
                  ? "bg-blue-600/10 text-blue-500 border border-blue-500/20 shadow-[0_0_15px_rgba(37,99,235,0.1)]"
                  : "text-zinc-500 hover:bg-zinc-900 hover:text-zinc-200"
              )}
            >
              <div className="flex items-center gap-3">
                <Icon className={cn("h-4 w-4 transition-colors", isActive ? "text-blue-500" : "text-zinc-600 group-hover:text-zinc-300")} />
                <span className={cn("text-sm font-bold tracking-wide", isActive ? "text-white" : "")}>{item.label}</span>
              </div>
              {isActive && <div className="w-1 h-4 bg-blue-500 rounded-full shadow-[0_0_8px_#3b82f6]" />}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-zinc-900">
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full justify-start gap-3 text-zinc-500 hover:text-rose-500 hover:bg-rose-500/5 rounded-xl h-12 transition-colors group"
        >
          <LogOut className="h-4 w-4 text-zinc-600 group-hover:text-rose-500" />
          <span className="text-sm font-bold uppercase tracking-wider">Sair</span>
        </Button>
      </div>
    </aside>
  );
}
