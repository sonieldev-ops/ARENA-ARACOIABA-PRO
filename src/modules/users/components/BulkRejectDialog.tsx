import React, { useState } from 'react';
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
import { Textarea } from "@/components/ui/textarea";
import { Loader2, XCircle, AlertTriangle } from 'lucide-react';

interface BulkRejectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  selectedUsers: UserProfile[];
  isLoading: boolean;
}

export function BulkRejectDialog({
  isOpen,
  onClose,
  onConfirm,
  selectedUsers,
  isLoading
}: BulkRejectDialogProps) {
  const [reason, setReason] = useState('');
  const count = selectedUsers.length;

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <XCircle className="w-5 h-5 text-red-500" />
            Rejeição em Lote
          </AlertDialogTitle>
          <AlertDialogDescription>
            Você está prestes a rejeitar o acesso de <strong>{count}</strong> usuário(s).
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="py-4 space-y-4">
          <div className="bg-red-50 border border-red-100 p-3 rounded-md flex gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
            <div className="text-xs text-red-800">
              Esta ação impedirá que estes usuários acessem o sistema com suas funções solicitadas.
              Um log de auditoria será gerado para cada um.
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Motivo da Rejeição (Será aplicado a todos):
            </label>
            <Textarea
              placeholder="Ex: Documentação incompleta ou perfil não condiz com os requisitos do evento."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="resize-none"
              rows={3}
            />
            <p className="text-[10px] text-slate-500 italic">
              Este motivo ficará registrado no histórico administrativo do usuário.
            </p>
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading} onClick={() => setReason('')}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              if (!reason.trim()) return;
              onConfirm(reason);
            }}
            disabled={isLoading || !reason.trim()}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processando...
              </>
            ) : (
              "Confirmar Rejeição"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
