'use client';

import { Plus, Eye, Edit2 } from 'lucide-react';
import { AdminPageHeader } from '@/src/modules/admin/components/AdminPageHeader';
import { AdminActionButton } from '@/src/modules/admin/components/AdminActionButton';
import { AdminDataTable } from '@/src/modules/admin/components/AdminDataTable';
import { AdminStatusBadge } from '@/src/modules/admin/components/AdminStatusBadge';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Team {
  id: string;
  name: string;
  championshipName: string;
  city: string;
  status: string;
}

export default function TeamsPage() {
  const router = useRouter();
  const [data, setData] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/teams')
      .then(res => res.json())
      .then(json => {
        if (Array.isArray(json)) setData(json);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const columns = [
    { header: 'Nome', accessorKey: 'name' as keyof Team, className: 'font-bold text-white' },
    { header: 'Campeonato', accessorKey: 'championshipName' as keyof Team },
    { header: 'Cidade', accessorKey: 'city' as keyof Team },
    {
      header: 'Status',
      cell: (item: Team) => <AdminStatusBadge status={item.status} />
    },
    {
      header: 'Ações',
      className: 'text-right',
      cell: (item: Team) => (
        <div className="flex justify-end gap-2">
          <AdminActionButton
            variant="outline"
            size="icon-sm"
            onClick={() => router.push(`/admin/times/${item.id}`)}
          >
            <Eye className="h-4 w-4" />
          </AdminActionButton>
          <AdminActionButton
            variant="outline"
            size="icon-sm"
            onClick={() => router.push(`/admin/times/${item.id}/edit`)}
          >
            <Edit2 className="h-4 w-4" />
          </AdminActionButton>
        </div>
      )
    },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Times"
        subtitle="Gerencie todos os times inscritos nos campeonatos."
        action={
          <AdminActionButton icon={Plus} onClick={() => router.push('/admin/times/new')}>
            Novo Time
          </AdminActionButton>
        }
      />

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
        </div>
      ) : (
        <AdminDataTable
          columns={columns}
          data={data}
          emptyMessage="Nenhum time encontrado."
        />
      )}
    </div>
  );
}
