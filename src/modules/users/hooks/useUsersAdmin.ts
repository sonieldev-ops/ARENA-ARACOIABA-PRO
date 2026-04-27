import { useState, useEffect, useCallback } from 'react';
import { UsersAdminService } from '../services/users-admin.service';
import { UserAdminRow, UserAdminStats } from '../types/user-admin.types';
import { UserRole, UserStatus } from '@/src/types/auth';
import { toast } from 'sonner';

export function useUsersAdmin() {
  const [users, setUsers] = useState<UserAdminRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState({
    status: undefined as UserStatus | undefined,
    role: undefined as UserRole | undefined,
    isPending: false,
    search: '',
  });

  const [stats, setStats] = useState<UserAdminStats>({
    total: 0,
    pending: 0,
    active: 0,
    suspended: 0,
    blocked: 0,
  });

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await UsersAdminService.listUsers(filters);
      setUsers(data);

      // Cálculo simplificado de stats baseado no fetch atual (para dashboards reais, usar aggregation queries ou stats docs)
      const newStats: UserAdminStats = {
        total: data.length,
        pending: data.filter(u => u.status === UserStatus.PENDING_APPROVAL).length,
        active: data.filter(u => u.status === UserStatus.ACTIVE).length,
        suspended: data.filter(u => u.status === UserStatus.SUSPENDED).length,
        blocked: data.filter(u => u.status === UserStatus.BLOCKED).length,
      };
      setStats(newStats);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError('Falha ao carregar usuários.');
      toast.error('Erro ao carregar lista de usuários');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleApprove = async (uid: string) => {
    try {
      await UsersAdminService.approveUser({ targetUserId: uid });
      toast.success('Usuário aprovado com sucesso');
      await fetchUsers();
    } catch (err: any) {
      toast.error('Erro ao aprovar usuário: ' + err.message);
    }
  };

  const handleReject = async (uid: string, reason: string) => {
    try {
      await UsersAdminService.rejectUser({ targetUserId: uid, reason });
      toast.success('Usuário rejeitado');
      await fetchUsers();
    } catch (err: any) {
      toast.error('Erro ao rejeitar usuário: ' + err.message);
    }
  };

  const handleChangeAccess = async (payload: any) => {
    try {
      await UsersAdminService.changeUserAccess(payload);
      toast.success('Acesso atualizado com sucesso');
      await fetchUsers();
    } catch (err: any) {
      toast.error('Erro ao alterar acesso: ' + err.message);
    }
  };

  return {
    users,
    loading,
    error,
    filters,
    setFilters,
    stats,
    refresh: fetchUsers,
    actions: {
      approve: handleApprove,
      reject: handleReject,
      changeAccess: handleChangeAccess,
    }
  };
}
