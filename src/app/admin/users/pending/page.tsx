'use client';

import { CheckCircle, XCircle, User } from 'lucide-react';
import { AdminPageHeader } from '@/src/modules/admin/components/AdminPageHeader';
import { AdminActionButton } from '@/src/modules/admin/components/AdminActionButton';
import { AdminDataTable } from '@/src/modules/admin/components/AdminDataTable';
import { AdminStatusBadge } from '@/src/modules/admin/components/AdminStatusBadge';

interface PendingUser {
  uid: string;
  displayName: string;
  email: string;
  requestedRole: string;
  date: string;
}

const mockPendingUsers: PendingUser[] = [
  { uid: '4', displayName: 'Roberto Técnico', email: 'roberto@outlook.com', requestedRole: 'STAFF', date: '2 horas atrás' },
  { uid: '5', displayName: 'Maria Fotógrafa', email: 'maria@foto.com', requestedRole: 'STAFF', date: '5 horas atrás' },
];

export default function PendingUsersPage() {
  const columns = [
    {
      header: 'Usuário',
      cell: (item: PendingUser) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center">
            <User className="h-4 w-4 text-slate-500" />
          </div>
          <div>
            <p className="font-bold text-white">{item.displayName}</p>
            <p className="text-xs text-slate-500">{item.email}</p>
          </div>
        </div>
      )
    },
    { header: 'Role Solicitada', accessorKey: 'requestedRole' as keyof PendingUser },
    { header: 'Solicitado em', accessorKey: 'date' as keyof PendingUser },
    {
      header: 'Ações',
      className: 'text-right',
      cell: (item: PendingUser) => (
        <div className="flex justify-end gap-2">
          <AdminActionButton
            variant="default"
            size="sm"
            className="bg-green-600 hover:bg-green-700"
            onClick={() => console.log('Aprovar', item.uid)}
          >
            <CheckCircle className="h-4 w-4" />
            Aprovar
          </AdminActionButton>
          <AdminActionButton
            variant="outline"
            size="sm"
            className="text-red-500 border-red-500/20 hover:bg-red-500/10"
            onClick={() => console.log('Rejeitar', item.uid)}
          >
            <XCircle className="h-4 w-4" />
            Rejeitar
          </AdminActionButton>
        </div>
      )
    },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Aprovações Pendentes"
        subtitle="Analise e aprove novos usuários ou solicitações de acesso."
      />

      <AdminDataTable
        columns={columns}
        data={mockPendingUsers}
        emptyMessage="Nenhum usuário aguardando aprovação."
      />
    </div>
  );
}
