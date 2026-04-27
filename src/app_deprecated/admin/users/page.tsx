'use client';

import { useState, useEffect } from 'react';
import { AdminPageHeader } from '@/src/modules/admin/components/AdminPageHeader';
import { AdminDataTable } from '@/src/modules/admin/components/AdminDataTable';
import { AdminStatusBadge } from '@/src/modules/admin/components/AdminStatusBadge';
import { AdminActionButton } from '@/src/modules/admin/components/AdminActionButton';
import { Search, Shield, UserX, UserCheck, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      setUsers(data);
    } catch (error) {
      toast.error('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (userId: string, status: string) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, status })
      });
      if (res.ok) {
        toast.success('Status atualizado');
        fetchUsers();
      }
    } catch (error) {
      toast.error('Erro ao atualizar status');
    }
  };

  const columns = [
    { header: 'Nome', accessorKey: 'displayName', className: 'font-bold text-white' },
    { header: 'Email', accessorKey: 'email' },
    { header: 'Papel', accessorKey: 'role' },
    {
      header: 'Status',
      cell: (item: any) => <AdminStatusBadge status={item.status} />
    },
    {
      header: 'Ações',
      className: 'text-right',
      cell: (item: any) => (
        <div className="flex justify-end gap-2">
          {item.status === 'PENDING_APPROVAL' && (
            <AdminActionButton
              variant="outline"
              size="icon-sm"
              onClick={() => handleUpdateStatus(item.id, 'ACTIVE')}
              title="Aprovar"
            >
              <UserCheck className="h-4 w-4 text-green-500" />
            </AdminActionButton>
          )}
          <AdminActionButton
            variant="outline"
            size="icon-sm"
            onClick={() => handleUpdateStatus(item.id, item.status === 'BLOCKED' ? 'ACTIVE' : 'BLOCKED')}
            title={item.status === 'BLOCKED' ? 'Desbloquear' : 'Bloquear'}
          >
            <UserX className="h-4 w-4 text-red-500" />
          </AdminActionButton>
        </div>
      )
    }
  ];

  const filteredUsers = users.filter(u =>
    u.displayName?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Gestão de Usuários"
        subtitle="Controle quem acessa o painel e aprove novos cadastros."
      />

      <div className="flex items-center gap-4 bg-slate-900/50 p-4 border border-slate-800 rounded-2xl">
        <Search className="h-5 w-5 text-slate-500" />
        <Input
          placeholder="Buscar por nome ou email..."
          className="bg-transparent border-none focus-visible:ring-0 text-white"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-red-600" /></div>
      ) : (
        <AdminDataTable
          columns={columns}
          data={filteredUsers}
          emptyMessage="Nenhum usuário encontrado."
        />
      )}
    </div>
  );
}
