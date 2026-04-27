import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { UserProfile } from '@/src/types/auth';
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';

interface BulkApproveDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  selectedUsers: UserProfile[];
  isLoading: boolean;
}

export function BulkApproveDialog({
  isOpen,
  onClose,
  onConfirm,
  selectedUsers,
  isLoading
}: BulkApproveDialogProps) {
  const count = selectedUsers.length;

  // Agrupar por requestedRole
  const roleGroups = selectedUsers.reduce((acc, user) => {
    const role = user.requestedRole || user.role;
    acc[role] = (acc[role] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const nonPending = selectedUsers.filter(u => u.status !== 'PENDING_APPROVAL');

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            Aprovação em Lote
          </AlertDialogTitle>
          <AlertDialogDescription>
            Você está prestes a aprovar <strong>{count}</strong> usuário(s) de uma vez.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-slate-700">Resumo por Perfil Solicitado:</h4>
            <div className="flex flex-wrap gap-2">
              {Object.entries(roleGroups).map(([role, qty]) => (
                <Badge key={role} variant="secondary" className="bg-slate-100">
                  {role}: {qty}
                </Badge>
              ))}
            </div>
          </div>

          {nonPending.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 p-3 rounded-md flex gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
              <div className="text-xs text-amber-800">
                Atenção: <strong>{nonPending.length}</strong> usuário(s) já não estão em estado pendente.
                A operação irá ignorar ou re-validar estes perfis dependendo da lógica do servidor.
              </div>
            </div>
          )}

          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-slate-700">Lista de selecionados:</h4>
            <ScrollArea className="h-32 rounded-md border p-2">
              {selectedUsers.map(user => (
                <div key={user.uid} className="text-xs py-1 border-b last:border-0 flex justify-between items-center">
                  <span>{user.fullName}</span>
                  <span className="text-slate-400">{user.email}</span>
                </div>
              ))}
            </ScrollArea>
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={isLoading}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processando...
              </>
            ) : (
              "Confirmar Aprovação"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
