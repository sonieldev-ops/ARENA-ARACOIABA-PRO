'use client';

import { useUsersAdmin } from '@/src/modules/users/hooks/useUsersAdmin';
import { UsersTable } from '@/src/modules/users/components/UsersTable';
import { UserAdminRow } from '@/src/modules/users/types/user-admin.types';

export default function AdminUsersPage() {
  const { users, loading, handleApprove, handleReject, handleChangeAccess, handleBulkApprove } = useUsersAdmin();

  const actions = {
    onApprove: (user: UserAdminRow) => handleApprove(user.uid),
    onReject: (user: UserAdminRow) => {
      const reason = prompt('Motivo da rejeição:');
      if (reason) handleReject(user.uid, reason);
    },
    onChangeAccess: (user: UserAdminRow) => {
      // Aqui poderíamos abrir um modal, por enquanto simplificado
      console.log('Change access for', user.uid);
    },
    onBulkApprove: handleBulkApprove
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gestão de Usuários</h1>
        <p className="text-muted-foreground">
          Gerencie permissões, aprove novos acessos e monitore o status dos usuários da plataforma.
        </p>
      </div>

      <UsersTable
        data={users}
        loading={loading}
        actions={actions}
      />
    </div>
  );
}
