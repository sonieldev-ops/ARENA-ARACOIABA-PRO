import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { UserProfile, UserRole, UserStatus } from '@/src/types/auth';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, ShieldAlert, UserCog } from 'lucide-react';

interface BulkChangeAccessDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: { nextRole?: UserRole, nextStatus?: UserStatus, reason: string, revokeSessions: boolean }) => void;
  selectedUsers: UserProfile[];
  isLoading: boolean;
}

export function BulkChangeAccessDialog({
  isOpen,
  onClose,
  onConfirm,
  selectedUsers,
  isLoading
}: BulkChangeAccessDialogProps) {
  const [nextRole, setNextRole] = useState<UserRole | undefined>();
  const [nextStatus, setNextStatus] = useState<UserStatus | undefined>();
  const [reason, setReason] = useState('');
  const [revokeSessions, setRevokeSessions] = useState(true);

  const count = selectedUsers.length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nextRole && !nextStatus) return;
    onConfirm({ nextRole, nextStatus, reason, revokeSessions });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCog className="w-5 h-5 text-blue-500" />
            Alterar Acesso em Lote
          </DialogTitle>
          <DialogDescription>
            Alterando permissões ou status de <strong>{count}</strong> usuário(s).
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Novo Perfil (Opcional):</label>
            <Select onValueChange={(v) => setNextRole(v as UserRole)}>
              <SelectTrigger>
                <SelectValue placeholder="Manter perfis atuais" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(UserRole).map(role => (
                  <SelectItem key={role} value={role}>{role}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Novo Status (Opcional):</label>
            <Select onValueChange={(v) => setNextStatus(v as UserStatus)}>
              <SelectTrigger>
                <SelectValue placeholder="Manter status atuais" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(UserStatus).map(status => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Motivo da Alteração:</label>
            <Textarea
              placeholder="Descreva o motivo desta mudança em massa..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={2}
              required
            />
          </div>

          <div className="flex items-center space-x-2 bg-slate-50 p-3 rounded-md border border-slate-100">
            <Checkbox
              id="revoke"
              checked={revokeSessions}
              onCheckedChange={(checked) => setRevokeSessions(!!checked)}
            />
            <div className="grid gap-1.5 leading-none">
              <label htmlFor="revoke" className="text-xs font-medium leading-none cursor-pointer">
                Revogar sessões ativas
              </label>
              <p className="text-[10px] text-slate-500">
                Força os usuários a fazerem login novamente para aplicar as novas claims.
              </p>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-100 p-3 rounded-md flex gap-3">
            <ShieldAlert className="w-5 h-5 text-blue-500 shrink-0" />
            <div className="text-[11px] text-blue-800">
              Mudanças de <strong>Role</strong> afetam diretamente as permissões do sistema.
              Certifique-se de que todos os selecionados devem receber este novo nível de acesso.
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading || (!nextRole && !nextStatus) || !reason.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Aplicar Alterações
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
