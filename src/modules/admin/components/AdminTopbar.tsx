'use client';

import { Bell, Search, UserCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

export function AdminTopbar() {
  return (
    <header className="h-16 border-b border-slate-800 bg-slate-950/50 backdrop-blur-md sticky top-0 z-40 px-8 flex items-center justify-between">
      <div className="flex items-center gap-4 w-96">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <Input
            placeholder="Buscar campeonatos, times ou atletas..."
            className="bg-slate-900/50 border-slate-800 pl-10 h-10 rounded-xl focus-visible:ring-red-600"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="relative text-slate-400 hover:text-white rounded-xl">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-600 rounded-full border-2 border-slate-950" />
        </Button>

        <div className="h-8 w-[1px] bg-slate-800 mx-2" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-3 px-2 hover:bg-slate-900 rounded-xl">
              <div className="text-right hidden md:block">
                <p className="text-sm font-bold text-white">Administrador</p>
                <p className="text-[10px] font-medium text-slate-500 uppercase tracking-tighter">Super Admin</p>
              </div>
              <UserCircle className="h-8 w-8 text-slate-400" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-slate-950 border-slate-800 text-slate-200">
            <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-slate-800" />
            <DropdownMenuItem className="hover:bg-slate-900">Perfil</DropdownMenuItem>
            <DropdownMenuItem className="hover:bg-slate-900">Configurações</DropdownMenuItem>
            <DropdownMenuSeparator className="bg-slate-800" />
            <DropdownMenuItem className="text-red-400 hover:bg-red-400/10 hover:text-red-400">Sair</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
