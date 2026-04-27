import { ColumnDef } from "@tanstack/react-table";
import { UserAdminRow } from "../types/user-admin.types";
import { UserRoleBadge } from "../components/UserRoleBadge";
import { UserStatusBadge } from "../components/UserStatusBadge";
import { formatFirebaseDate } from "@/src/lib/utils";
import { MoreHorizontal, ShieldCheck, UserCheck, UserX, Settings2, Eye } from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";

export const createColumns = (actions: any): ColumnDef<UserAdminRow>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        className="border-zinc-700 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Selecionar todos"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        className="border-zinc-700 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Selecionar linha"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "fullName",
    header: "Nome",
    cell: ({ row }) => (
      <div className="flex flex-col gap-0.5">
        <span className="font-bold text-white tracking-tight">{row.original.fullName}</span>
        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">{row.original.email}</span>
      </div>
    ),
  },
  {
    accessorKey: "role",
    header: "Papel",
    cell: ({ row }) => (
      <div className="flex flex-col gap-1.5">
        <UserRoleBadge role={row.original.role} />
        {row.original.status === UserStatus.PENDING_APPROVAL && row.original.requestedRole && (
          <span className="text-[9px] text-amber-500/80 font-black uppercase tracking-[0.15em] italic">
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
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="text-xs font-bold text-zinc-400">
          {formatFirebaseDate(row.original.createdAt).split(' às ')[0]}
        </span>
        <span className="text-[9px] font-medium text-zinc-600 uppercase">
          {formatFirebaseDate(row.original.createdAt).split(' às ')[1]}
        </span>
      </div>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const user = row.original;
      const isPending = user.status === UserStatus.PENDING_APPROVAL;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-9 w-9 p-0 hover:bg-zinc-800 rounded-xl text-zinc-500 hover:text-white transition-all">
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 bg-zinc-950 border-zinc-900 text-zinc-300 rounded-2xl p-2 shadow-2xl">
            <DropdownMenuLabel className="px-3 py-2 text-[10px] font-black uppercase text-zinc-600 tracking-widest">Ações do Usuário</DropdownMenuLabel>

            <DropdownMenuSeparator className="bg-zinc-900" />

            <DropdownMenuItem className="focus:bg-zinc-900 rounded-xl px-3 py-2.5 cursor-pointer" asChild>
              <Link href={`/admin/usuarios/${user.uid}`} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center border border-zinc-800">
                  <Eye className="h-4 w-4" />
                </div>
                <span className="font-bold text-sm">Ver Detalhes</span>
              </Link>
            </DropdownMenuItem>

            {isPending && (
              <>
                <DropdownMenuSeparator className="bg-zinc-900" />
                <DropdownMenuItem onClick={() => actions.onApprove(user)} className="text-emerald-500 focus:bg-emerald-500/5 focus:text-emerald-400 rounded-xl px-3 py-2.5 cursor-pointer flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                    <UserCheck className="h-4 w-4" />
                  </div>
                  <span className="font-bold text-sm uppercase tracking-widest">Aprovar</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => actions.onReject(user)} className="text-rose-500 focus:bg-rose-500/5 focus:text-rose-400 rounded-xl px-3 py-2.5 cursor-pointer flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
                    <UserX className="h-4 w-4" />
                  </div>
                  <span className="font-bold text-sm uppercase tracking-widest">Rejeitar</span>
                </DropdownMenuItem>
              </>
            )}

            <DropdownMenuSeparator className="bg-zinc-900" />

            <DropdownMenuItem onClick={() => actions.onChangeAccess(user)} className="focus:bg-zinc-900 rounded-xl px-3 py-2.5 cursor-pointer flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center border border-zinc-800">
                <Settings2 className="h-4 w-4" />
              </div>
              <span className="font-bold text-sm">Alterar Acesso</span>
            </DropdownMenuItem>

            <DropdownMenuItem className="text-rose-600 focus:bg-rose-600/5 focus:text-rose-500 rounded-xl px-3 py-2.5 cursor-pointer flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-rose-600/10 flex items-center justify-center border border-rose-600/20">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <span className="font-bold text-sm">Bloquear</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
