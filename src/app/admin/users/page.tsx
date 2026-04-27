'use client';

import { useUsersAdmin } from '@/src/modules/users/hooks/useUsersAdmin';
import { UsersTable } from '@/src/modules/users/components/UsersTable';
import { UsersToolbar } from '@/src/modules/users/components/UsersToolbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Users,
  UserClock,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert
} from 'lucide-react';
import { useState } from 'react';
import { UserAdminRow } from '@/src/modules/users/types/user-admin.types';

// Modais (em um cenário real, estariam em arquivos separados)
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

export default function UsersAdminPage() {
  const { users, loading, stats, filters, setFilters, refresh, actions } = useUsersAdmin();

  // Estados para modais
  const [selectedUser, setSelectedUser] = useState<UserAdminRow | null>(null);
  const [modalType, setModalType] = useState<'approve' | 'reject' | 'access' | null>(null);
  const [reason, setReason] = useState('');

  const closeModals = () => {
    setSelectedUser(null);
    setModalType(null);
    setReason('');
  };

  const kpiCards = [
    { title: 'Total', value: stats.total, icon: Users, color: 'text-blue-600' },
    { title: 'Pendentes', value: stats.pending, icon: UserClock, color: 'text-yellow-600' },
    { title: 'Ativos', value: stats.active, icon: CheckCircle2, color: 'text-green-600' },
    { title: 'Suspensos', value: stats.suspended, icon: AlertTriangle, color: 'text-orange-600' },
    { title: 'Bloqueados', value: stats.blocked, icon: ShieldAlert, color: 'text-red-600' },
  ];

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Gestão de Usuários</h2>
          <p className="text-muted-foreground">
            Administre perfis, aprove novos membros e controle o acesso à plataforma.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {kpiCards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Listagem Geral</CardTitle>
        </CardHeader>
        <CardContent>
          <UsersToolbar
            filters={filters}
            setFilters={setFilters}
            onRefresh={refresh}
          />
          <UsersTable
            data={users}
            loading={loading}
            actions={{
              onApprove: (u) => { setSelectedUser(u); setModalType('approve'); },
              onReject: (u) => { setSelectedUser(u); setModalType('reject'); },
              onChangeAccess: (u) => { setSelectedUser(u); setModalType('access'); },
            }}
          />
        </CardContent>
      </Card>

      {/* Modal de Aprovação */}
      <Dialog open={modalType === 'approve'} onOpenChange={closeModals}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Aprovação</DialogTitle>
            <DialogDescription>
              Você está aprovando o usuário <strong>{selectedUser?.fullName}</strong> como <strong>{selectedUser?.requestedRole}</strong>.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={closeModals}>Cancelar</Button>
            <Button onClick={async () => {
              await actions.approve(selectedUser!.uid);
              closeModals();
            }}>Confirmar Aprovação</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Rejeição */}
      <Dialog open={modalType === 'reject'} onOpenChange={closeModals}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeitar Solicitação</DialogTitle>
            <DialogDescription>
              Informe o motivo da rejeição para o usuário {selectedUser?.fullName}.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="reason">Motivo</Label>
              <Input
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Ex: Documentação pendente"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={closeModals}>Cancelar</Button>
            <Button variant="destructive" disabled={!reason} onClick={async () => {
              await actions.reject(selectedUser!.uid, reason);
              closeModals();
            }}>Rejeitar Usuário</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* O Modal de Alteração de Acesso seguiria a mesma lógica expandida para selects de role/status */}
    </div>
  );
}
