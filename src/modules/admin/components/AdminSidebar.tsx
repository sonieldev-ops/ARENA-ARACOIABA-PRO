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
  ChevronRight
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { Button } from '@/components/ui/button';
import { auth } from '@/src/lib/firebase/client';
import { signOut } from 'firebase/auth';

const menuItems = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/admin' },
  { label: 'Campeonatos', icon: Trophy, href: '/admin/championships' },
  { label: 'Times', icon: Users, href: '/admin/teams' },
  { label: 'Atletas', icon: UserSquare2, href: '/admin/athletes' },
  { label: 'Partidas', icon: Swords, href: '/admin/matches' },
  { label: 'Controle Ao Vivo', icon: Activity, href: '/admin/live-control' },
  { label: 'Classificação', icon: ListOrdered, href: '/admin/ranking' },
  { label: 'Artilharia', icon: Goal, href: '/admin/scorers' },
  { type: 'divider', label: 'Gestão' },
  { label: 'Usuários', icon: Users, href: '/admin/users' },
  { label: 'Aprovações', icon: ShieldCheck, href: '/admin/users/pending' },
  { label: 'Governança', icon: ShieldCheck, href: '/admin/governance' },
  { label: 'Auditoria', icon: ClipboardList, href: '/admin/audit' },
  { label: 'Notificações', icon: Bell, href: '/admin/notifications' },
  { label: 'Configurações', icon: Settings, href: '/admin/settings' },
];

export function AdminSidebar() {
  const pathname = usePathname();

  const handleLogout = async () => {
    await signOut(auth);
    window.location.href = '/login';
  };

  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col fixed inset-y-0 z-50">
      <div className="p-6">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center font-bold text-white">
            A
          </div>
          <span className="text-xl font-black text-white tracking-tighter">
            ARENA<span className="text-red-600">PRO</span>
          </span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 py-2 space-y-1 custom-scrollbar">
        {menuItems.map((item, index) => {
          if (item.type === 'divider') {
            return (
              <div key={index} className="pt-4 pb-2 px-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  {item.label}
                </p>
              </div>
            );
          }

          const isActive = pathname === item.href || (item.href !== '/admin' && pathname?.startsWith(item.href!));
          const Icon = item.icon!;

          return (
            <Link
              key={item.href}
              href={item.href!}
              className={cn(
                "flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group",
                isActive
                  ? "bg-red-600 text-white shadow-lg shadow-red-900/20"
                  : "text-slate-400 hover:bg-slate-900 hover:text-slate-100"
              )}
            >
              <div className="flex items-center gap-3">
                <Icon className={cn("h-5 w-5", isActive ? "text-white" : "text-slate-500 group-hover:text-slate-300")} />
                <span className="text-sm font-bold">{item.label}</span>
              </div>
              {isActive && <ChevronRight className="h-4 w-4 opacity-50" />}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full justify-start gap-3 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-xl h-12"
        >
          <LogOut className="h-5 w-5" />
          <span className="text-sm font-bold">Sair do Painel</span>
        </Button>
      </div>
    </aside>
  );
}
