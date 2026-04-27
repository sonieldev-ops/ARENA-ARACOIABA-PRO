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
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="bg-slate-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-6 border border-slate-700 backdrop-blur-md bg-opacity-95">
        <div className="flex items-center gap-3 pr-6 border-r border-slate-700">
          <span className="bg-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">
            {count}
          </span>
          <span className="text-sm font-medium">Usuários selecionados</span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-400/10 gap-2 h-9 rounded-full"
            onClick={onApprove}
          >
            <CheckCircle className="w-4 h-4" />
            Aprovar
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="text-red-400 hover:text-red-300 hover:bg-red-400/10 gap-2 h-9 rounded-full"
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
                className="text-slate-300 hover:text-white hover:bg-white/10 gap-2 h-9 rounded-full"
              >
                <ShieldAlert className="w-4 h-4" />
                Acesso
                <ChevronDown className="w-3 h-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-slate-900 border-slate-700 text-slate-200">
              <DropdownMenuItem onClick={onChangeAccess} className="gap-2 focus:bg-slate-800 focus:text-white cursor-pointer">
                <UserCog className="w-4 h-4" />
                Alterar Perfil / Status
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2 text-red-400 focus:bg-red-400/10 focus:text-red-300 cursor-pointer">
                <Trash2 className="w-4 h-4" />
                Desativar em Massa
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="pl-6 border-l border-slate-700">
          <Button
            variant="ghost"
            size="sm"
            className="text-slate-400 hover:text-white hover:bg-white/5 h-9 rounded-full"
            onClick={onClearSelection}
          >
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  );
}
