import { UserProfile, UserStatus } from '@/src/types/auth';
import { Button } from '@/components/ui/button';
import {
  UserCheck,
  UserX,
  ShieldAlert,
  Ban,
  RefreshCw,
  MoreVertical
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface UserQuickActionsProps {
  user: UserProfile;
  onApprove: () => void;
  onReject: () => void;
  onChangeAccess: () => void;
}

export function UserQuickActions({ user, onApprove, onReject, onChangeAccess }: UserQuickActionsProps) {
  const isPending = user.status === UserStatus.PENDING_APPROVAL;
  const isBlocked = user.status === UserStatus.BLOCKED || user.status === UserStatus.SUSPENDED;

  return (
    <div className="flex items-center gap-2">
      {isPending && (
        <>
          <Button
            variant="default"
            className="bg-green-600 hover:bg-green-700 h-9"
            onClick={onApprove}
          >
            <UserCheck className="mr-2 h-4 w-4" /> Aprovar
          </Button>
          <Button
            variant="outline"
            className="text-red-600 border-red-200 hover:bg-red-50 h-9"
            onClick={onReject}
          >
            <UserX className="mr-2 h-4 w-4" /> Rejeitar
          </Button>
        </>
      )}

      {!isPending && (
        <Button variant="outline" onClick={onChangeAccess} className="h-9">
          <ShieldAlert className="mr-2 h-4 w-4" /> Gerenciar Acesso
        </Button>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Ações Administrativas</DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={onChangeAccess}>
            <ShieldAlert className="mr-2 h-4 w-4" /> Alterar Papel (Role)
          </DropdownMenuItem>

          {isBlocked ? (
            <DropdownMenuItem onClick={onChangeAccess}>
              <RefreshCw className="mr-2 h-4 w-4 text-green-600" /> Reativar Usuário
            </DropdownMenuItem>
          ) : (
            <>
              <DropdownMenuItem onClick={onChangeAccess}>
                <Ban className="mr-2 h-4 w-4 text-orange-600" /> Suspender
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onChangeAccess} className="text-red-600">
                <Ban className="mr-2 h-4 w-4" /> Bloquear Permanentemente
              </DropdownMenuItem>
            </>
          )}

          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => window.print()}>
            Gerar Relatório de Auditoria
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
