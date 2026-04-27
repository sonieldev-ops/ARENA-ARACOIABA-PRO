'use client';

import { Plus, Eye, Edit2 } from 'lucide-react';
import { AdminPageHeader } from '@/src/modules/admin/components/AdminPageHeader';
import { AdminActionButton } from '@/src/modules/admin/components/AdminActionButton';
import { AdminDataTable } from '@/src/modules/admin/components/AdminDataTable';
import { AdminStatusBadge } from '@/src/modules/admin/components/AdminStatusBadge';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Championship {
  id: string;
  name: string;
  season: string;
  city: string;
  status: string;
}

export default function ChampionshipsPage() {
  const router = useRouter();
  const [data, setData] = useState<Championship[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/championships')
      .then(res => res.json())
      .then(json => {
        if (Array.isArray(json)) setData(json);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const columns = [
    { header: 'Nome', accessorKey: 'name' as keyof Championship, className: 'font-bold text-white' },
    { header: 'Temporada', accessorKey: 'season' as keyof Championship },
    { header: 'Cidade', accessorKey: 'city' as keyof Championship },
    {
      header: 'Status',
      cell: (item: Championship) => <AdminStatusBadge status={item.status} />
    },
    {
      header: 'Ações',
      className: 'text-right',
      cell: (item: Championship) => (
        <div className="flex justify-end gap-2">
          <AdminActionButton
            variant="outline"
            size="icon-sm"
            onClick={() => router.push(`/admin/campeonatos/${item.id}`)}
          >
            <Eye className="h-4 w-4" />
          </AdminActionButton>
          <AdminActionButton
            variant="outline"
            size="icon-sm"
            onClick={() => router.push(`/admin/campeonatos/${item.id}/edit`)}
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
        title="Campeonatos"
        subtitle="Gerencie todos os campeonatos e competições da Arena."
        action={
          <AdminActionButton icon={Plus} onClick={() => router.push('/admin/campeonatos/new')}>
            Novo Campeonato
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
          emptyMessage="Nenhum campeonato encontrado."
        />
      )}
    </div>
  );
}
