import React from 'react';
import { Button } from '@/components/ui/button';
import {
  CheckCircle,
  XCircle,
  ShieldAlert,
  UserCog,
  Trash2,
  ChevronDown
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserProfile } from '@/src/types/auth';

interface BulkActionsToolbarProps {
  selectedUsers: UserProfile[];
  onApprove: () => void;
  onReject: () => void;
  onChangeAccess: () => void;
  onClearSelection: () => void;
}

export function BulkActionsToolbar({
  selectedUsers,
  onApprove,
  onReject,
  onChangeAccess,
  onClearSelection
}: BulkActionsToolbarProps) {
  const count = selectedUsers.length;

  if (count === 0) return null;

  return (
    <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-8 duration-500">
      <div className="bg-zinc-950/90 text-white px-8 py-4 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center gap-8 border border-zinc-800 backdrop-blur-xl">
        <div className="flex items-center gap-4 pr-8 border-r border-zinc-800">
          <span className="bg-blue-600 text-white w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black shadow-[0_0_15px_rgba(37,99,235,0.4)] transform -rotate-6">
            {count}
          </span>
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Selecionados</span>
            <span className="text-xs font-bold text-white">Gestão em Massa</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10 gap-2 h-11 px-5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all"
            onClick={onApprove}
          >
            <CheckCircle className="w-4 h-4" />
            Aprovar
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 gap-2 h-11 px-5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all"
            onClick={onReject}
          >
            <XCircle className="w-4 h-4" />
            Rejeitar
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-zinc-400 hover:text-white hover:bg-zinc-800/50 gap-2 h-11 px-5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all"
              >
                <ShieldAlert className="w-4 h-4" />
                Acesso
                <ChevronDown className="w-3 h-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-zinc-950 border-zinc-800 text-zinc-300 rounded-2xl p-2 shadow-2xl">
              <DropdownMenuItem onClick={onChangeAccess} className="gap-3 focus:bg-zinc-900 rounded-xl px-4 py-3 cursor-pointer">
                <UserCog className="w-4 h-4" />
                <span className="font-bold text-xs uppercase tracking-wider">Alterar Perfil</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-3 text-rose-500 focus:bg-rose-500/5 focus:text-rose-400 rounded-xl px-4 py-3 cursor-pointer">
                <Trash2 className="w-4 h-4" />
                <span className="font-bold text-xs uppercase tracking-wider">Desativar</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="pl-8 border-l border-zinc-800">
          <Button
            variant="ghost"
            size="sm"
            className="text-zinc-600 hover:text-white hover:bg-transparent h-11 px-4 rounded-xl font-black uppercase text-[9px] tracking-[0.2em] transition-colors"
            onClick={onClearSelection}
          >
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  );
}
