'use client';

import * as React from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { UserAdminRow } from "../types/user-admin.types";
import { createColumns } from "../columns/users.columns";
import { BulkActionsToolbar } from "./BulkActionsToolbar";
import { BulkApproveDialog } from "./BulkApproveDialog";
import { BulkRejectDialog } from "./BulkRejectDialog";
import { BulkChangeAccessDialog } from "./BulkChangeAccessDialog";
import { BulkOperationResultDialog } from "./BulkOperationResultDialog";
import { useUserBulkActions } from "../hooks/useUserBulkActions";
import { UserProfile } from "@/src/types/auth";
import { Loader2 } from "lucide-react";

interface UsersTableProps {
  data: UserAdminRow[];
  loading?: boolean;
  onRefresh?: () => void;
  actions: {
    onApprove: (user: UserAdminRow) => void;
    onReject: (user: UserAdminRow) => void;
    onChangeAccess: (user: UserAdminRow) => void;
  };
}

export function UsersTable({ data, loading, actions, onRefresh }: UsersTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [rowSelection, setRowSelection] = React.useState({});

  const columns = React.useMemo(() => createColumns(actions), [actions]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      rowSelection,
    },
  });

  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const selectedUsers = selectedRows.map(row => row.original as unknown as UserProfile);

  const {
    isProcessing,
    lastResult,
    activeModal,
    setActiveModal,
    closeModal,
    handleBulkApprove,
    handleBulkReject,
    handleBulkChangeAccess
  } = useUserBulkActions(selectedUsers, () => {
    table.resetRowSelection();
    onRefresh?.();
  });

  if (loading) {
    return (
      <div className="w-full h-64 flex flex-col items-center justify-center bg-zinc-950/50 rounded-2xl border border-zinc-800 gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest">Sincronizando usuários...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950/50 overflow-hidden shadow-2xl backdrop-blur-sm">
        <Table>
          <TableHeader className="bg-zinc-900/50">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent border-zinc-800">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="text-zinc-500 font-black uppercase text-[10px] tracking-[0.2em] h-12">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="hover:bg-zinc-900/40 border-zinc-800/50 transition-colors group"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-4 text-zinc-300 font-medium">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow className="hover:bg-transparent border-none">
                <TableCell colSpan={columns.length} className="h-40 text-center">
                  <div className="flex flex-col items-center justify-center gap-2 opacity-20">
                    <Loader2 className="w-8 h-8 text-zinc-500" />
                    <p className="font-black uppercase text-xs tracking-widest text-zinc-500">Nenhum usuário encontrado.</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <div className="flex items-center justify-between py-4 px-6 border-t border-zinc-800 bg-zinc-900/30">
          <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
            <span className="text-blue-500">{table.getFilteredSelectedRowModel().rows.length}</span> de{" "}
            {table.getFilteredRowModel().rows.length} registros selecionados
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white rounded-lg h-8 uppercase text-[9px] font-black tracking-widest"
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white rounded-lg h-8 uppercase text-[9px] font-black tracking-widest"
            >
              Próximo
            </Button>
          </div>
        </div>
      </div>

      {/* Bulk Actions UI */}
      <BulkActionsToolbar
        selectedUsers={selectedUsers}
        onApprove={() => setActiveModal('APPROVE')}
        onReject={() => setActiveModal('REJECT')}
        onChangeAccess={() => setActiveModal('CHANGE_ACCESS')}
        onClearSelection={() => table.resetRowSelection()}
      />

      <BulkApproveDialog
        isOpen={activeModal === 'APPROVE'}
        onClose={closeModal}
        onConfirm={handleBulkApprove}
        selectedUsers={selectedUsers}
        isLoading={isProcessing}
      />

      <BulkRejectDialog
        isOpen={activeModal === 'REJECT'}
        onClose={closeModal}
        onConfirm={handleBulkReject}
        selectedUsers={selectedUsers}
        isLoading={isProcessing}
      />

      <BulkChangeAccessDialog
        isOpen={activeModal === 'CHANGE_ACCESS'}
        onClose={closeModal}
        onConfirm={handleBulkChangeAccess}
        selectedUsers={selectedUsers}
        isLoading={isProcessing}
      />

      <BulkOperationResultDialog
        isOpen={activeModal === 'RESULT'}
        result={lastResult}
        onClose={closeModal}
      />
    </div>
  );
}
