'use client';

import { useUsersAdmin } from '@/src/modules/users/hooks/useUsersAdmin';
import { UsersTable } from '@/src/modules/users/components/UsersTable';
import { UserAdminRow } from '@/src/modules/users/types/user-admin.types';
import { AdminPageHeader } from '@/src/modules/admin/components/AdminPageHeader';
import { Card, CardContent } from '@/components/ui/card';

export default function AdminUsersPage() {
  const { users, loading, refresh, actions } = useUsersAdmin();

  const tableActions = {
    onApprove: (user: UserAdminRow) => actions.approve(user.uid),
    onReject: (user: UserAdminRow) => {
      const reason = prompt('Motivo da rejeição:');
      if (reason) actions.reject(user.uid, reason);
    },
    onChangeAccess: (user: UserAdminRow) => {
      // Aqui poderíamos abrir o modal de detalhes ou o de troca rápida
      console.log('Change access for', user.uid);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
      <AdminPageHeader
        title="Gestão de Usuários"
        subtitle="Gerencie permissões, aprove novos acessos e monitore o status dos usuários da plataforma."
      />

      <div className="bg-zinc-900/40 border border-zinc-800 rounded-[2rem] p-1 shadow-2xl">
        <UsersTable
          data={users}
          loading={loading}
          actions={tableActions}
          onRefresh={refresh}
        />
      </div>
    </div>
  );
}
