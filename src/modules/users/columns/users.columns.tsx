import { ColumnDef } from "@tanstack/react-table";
import { UserAdminRow } from "../types/user-admin.types";
import { UserRoleBadge } from "../components/UserRoleBadge";
import { UserStatusBadge } from "../components/UserStatusBadge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { MoreHorizontal, ShieldCheck, UserCheck, UserX, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserStatus } from "@/src/types/auth";

export const createColumns = (actions: any): ColumnDef<UserAdminRow>[] => [
  {
    accessorKey: "fullName",
    header: "Nome",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-medium text-slate-900">{row.original.fullName}</span>
        <span className="text-xs text-slate-500">{row.original.email}</span>
      </div>
    ),
  },
  {
    accessorKey: "role",
    header: "Papel",
    cell: ({ row }) => (
      <div className="flex flex-col gap-1">
        <UserRoleBadge role={row.original.role} />
        {row.original.status === UserStatus.PENDING_APPROVAL && row.original.requestedRole && (
          <span className="text-[10px] text-orange-600 font-semibold italic">
            Solicitou: {row.original.requestedRole}
          </span>
        )}
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <UserStatusBadge status={row.original.status} />,
  },
  {
    accessorKey: "createdAt",
    header: "Cadastro",
    cell: ({ row }) => {
      const date = row.original.createdAt?.toDate?.() || new Date(row.original.createdAt);
      return (
        <span className="text-xs text-slate-600">
          {format(date, "dd/MM/yyyy HH:mm", { locale: ptBR })}
        </span>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const user = row.original;
      const isPending = user.status === UserStatus.PENDING_APPROVAL;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Ações</DropdownMenuLabel>

            {isPending && (
              <>
                <DropdownMenuItem onClick={() => actions.onApprove(user)} className="text-green-600">
                  <UserCheck className="mr-2 h-4 w-4" /> Aprovar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => actions.onReject(user)} className="text-red-600">
                  <UserX className="mr-2 h-4 w-4" /> Rejeitar
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}

            <DropdownMenuItem onClick={() => actions.onChangeAccess(user)}>
              <Settings2 className="mr-2 h-4 w-4" /> Alterar Acesso
            </DropdownMenuItem>

            <DropdownMenuItem onClick={() => window.location.href = `/admin/users/${user.uid}`}>
              <ShieldCheck className="mr-2 h-4 w-4" /> Ver Perfil
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
