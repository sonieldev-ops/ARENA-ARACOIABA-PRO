'use client';

import { Bell, Search, UserCircle, LogOut, User, Settings, Menu } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { NotificationBell } from '@/src/modules/notifications/components/NotificationBell';
import { useAuth } from '@/src/modules/auth/context/AuthContext';
import { authService } from '@/src/modules/auth/services/auth.service';
import { useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { translateRole } from '@/src/lib/utils';
import Link from 'next/link';

export function AdminTopbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const { user } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await authService.logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <header className="h-20 border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-xl sticky top-0 z-40 px-6 md:px-10 flex items-center justify-between">
      <div className="flex items-center gap-6 flex-1 max-w-xl">
        {onMenuClick && (
          <Button variant="ghost" size="icon" onClick={onMenuClick} className="md:hidden text-zinc-400">
            <Menu className="h-6 w-6" />
          </Button>
        )}

        <div className="relative w-full hidden sm:block group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600 group-focus-within:text-blue-500 transition-colors" />
          <Input
            placeholder="Pesquisar em toda a liga..."
            className="bg-zinc-900/50 border-zinc-800/80 pl-11 h-11 rounded-2xl focus-visible:ring-blue-600/50 text-zinc-200 w-full md:w-96 transition-all focus:bg-zinc-900"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <NotificationBell />

        <div className="h-10 w-[1px] bg-zinc-900 mx-1" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-4 px-3 py-2 hover:bg-zinc-900 rounded-2xl border border-transparent hover:border-zinc-800 transition-all">
              <div className="text-right hidden md:block">
                <p className="text-sm font-bold text-white tracking-wide">{user?.fullName || 'Administrador'}</p>
                <div className="flex items-center justify-end gap-1.5 mt-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_5px_#3b82f6]" />
                  <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">{translateRole(user?.role || '') || 'Super Admin'}</p>
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center border border-zinc-700">
                <User className="h-5 w-5 text-zinc-400" />
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 bg-zinc-950 border-zinc-900 text-zinc-300 rounded-2xl p-2 shadow-2xl">
            <DropdownMenuLabel className="px-3 py-2 text-[10px] font-black uppercase text-zinc-600 tracking-widest">Painel de Acesso</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-zinc-900" />
            <DropdownMenuItem className="focus:bg-zinc-900 rounded-xl px-3 py-2.5 cursor-pointer" asChild>
              <Link href="/admin/profile" className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center border border-zinc-800">
                  <User className="h-4 w-4" />
                </div>
                <span className="font-bold text-sm">Meu Perfil</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="focus:bg-zinc-900 rounded-xl px-3 py-2.5 cursor-pointer" asChild>
              <Link href="/admin/settings" className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center border border-zinc-800">
                  <Settings className="h-4 w-4" />
                </div>
                <span className="font-bold text-sm">Configurações</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-zinc-900" />
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-rose-500 focus:bg-rose-500/5 focus:text-rose-500 rounded-xl px-3 py-2.5 cursor-pointer flex items-center gap-3 transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
                <LogOut className="h-4 w-4" />
              </div>
              <span className="font-bold text-sm uppercase tracking-widest">Sair</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
