'use client';

import { useUserDetailAdmin } from '@/src/modules/users/hooks/useUserDetailAdmin';
import { useUsersAdmin } from '@/src/modules/users/hooks/useUsersAdmin'; // Para reuso das ações
import { UserProfileHeader } from '@/src/modules/users/components/UserProfileHeader';
import { UserProfileSummaryCard } from '@/src/modules/users/components/UserProfileSummaryCard';
import { UserAccessCard } from '@/src/modules/users/components/UserAccessCard';
import { UserMetadataCard } from '@/src/modules/users/components/UserMetadataCard';
import { UserTeamLinkCard } from '@/src/modules/users/components/UserTeamLinkCard';
import { UserAuditTimeline } from '@/src/modules/users/components/UserAuditTimeline';
import { UserAuditFilters } from '@/src/modules/users/components/UserAuditFilters';
import { UserQuickActions } from '@/src/modules/users/components/UserQuickActions';
import { useState } from 'react';
import { useParams } from 'next/navigation';

// Modais (Reusados ou simplificados para o exemplo)
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function UserDetailPage() {
  const params = useParams();
  const uid = params.uid as string;

  const { user, logs, loading, logsLoading, error, refresh, refreshLogs } = useUserDetailAdmin(uid);
  const { actions } = useUsersAdmin(); // Centraliza chamadas às Cloud Functions

  const [modalType, setModalType] = useState<'approve' | 'reject' | 'access' | null>(null);
  const [reason, setReason] = useState('');
  const [auditFilters, setAuditFilters] = useState({});

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
        <h1 className="text-2xl font-bold text-slate-800">{error || 'Usuário não encontrado'}</h1>
        <Button onClick={() => window.history.back()}>Voltar para Lista</Button>
      </div>
    );
  }

  const handleActionComplete = async () => {
    setModalType(null);
    setReason('');
    await refresh();
    await refreshLogs();
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-12">
      <UserProfileHeader user={user} />

      <div className="max-w-7xl mx-auto px-8 py-8 space-y-8">
        {/* Top Section: Quick Summary and Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-slate-900">Visão Geral do Perfil</h2>
            <p className="text-sm text-slate-500">Detalhes técnicos e operacionais de governança.</p>
          </div>
          <UserQuickActions
            user={user}
            onApprove={() => setModalType('approve')}
            onReject={() => setModalType('reject')}
            onChangeAccess={() => setModalType('access')}
          />
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <UserProfileSummaryCard user={user} />
          <UserAccessCard user={user} />
          <div className="space-y-6">
            <UserTeamLinkCard user={user} />
            <UserMetadataCard user={user} />
          </div>
        </div>

        {/* Audit Section */}
        <div className="pt-8 border-t border-slate-200">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-900">Histórico e Rastreabilidade</h2>
            <p className="text-sm text-slate-500">Timeline de todas as alterações críticas realizadas por administradores ou pelo sistema.</p>
          </div>

          <UserAuditFilters filters={auditFilters} setFilters={setAuditFilters} />

          <UserAuditTimeline
            logs={logs}
            loading={logsLoading}
          />
        </div>
      </div>

      {/* Modais de Ação */}
      <Dialog open={modalType === 'approve'} onOpenChange={() => setModalType(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Aprovação</DialogTitle>
            <DialogDescription>
              Você está aprovando o acesso de <strong>{user.fullName}</strong>. Isso aplicará o papel de <strong>{user.requestedRole}</strong> e ativará o perfil imediatamente.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setModalType(null)}>Cancelar</Button>
            <Button onClick={async () => {
              await actions.approve(user.uid);
              handleActionComplete();
            }}>Confirmar Aprovação</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={modalType === 'reject'} onOpenChange={() => setModalType(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeitar Solicitação</DialogTitle>
            <DialogDescription>Informe o motivo da rejeição. O usuário será notificado e permanecerá com acesso limitado.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="reject-reason">Motivo</Label>
            <Input
              id="reject-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ex: Documentação inválida"
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setModalType(null)}>Cancelar</Button>
            <Button variant="destructive" disabled={!reason} onClick={async () => {
              await actions.reject(user.uid, reason);
              handleActionComplete();
            }}>Confirmar Rejeição</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* O Modal de Gerenciamento de Acesso seria implementado aqui seguindo o padrão modular */}
    </div>
  );
}
