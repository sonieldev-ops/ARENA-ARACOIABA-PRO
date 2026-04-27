'use client';

import { Plus, Search, Eye, Edit2 } from 'lucide-react';
import { AdminPageHeader } from '@/src/modules/admin/components/AdminPageHeader';
import { AdminActionButton } from '@/src/modules/admin/components/AdminActionButton';
import { AdminDataTable } from '@/src/modules/admin/components/AdminDataTable';
import { AdminStatusBadge } from '@/src/modules/admin/components/AdminStatusBadge';
import { useRouter } from 'next/navigation';

interface Championship {
  id: string;
  name: string;
  season: string;
  city: string;
  status: string;
}

const mockChampionships: Championship[] = [
  { id: '1', name: 'Série Ouro 2024', season: '2024', city: 'Araçoiaba', status: 'ACTIVE' },
  { id: '2', name: 'Copa Verão', season: '2024', city: 'Araçoiaba', status: 'SCHEDULED' },
  { id: '3', name: 'Série Prata 2023', season: '2023', city: 'Araçoiaba', status: 'FINISHED' },
];

export default function ChampionshipsPage() {
  const router = useRouter();

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
            size="sm"
            onClick={() => router.push(`/admin/championships/${item.id}`)}
          >
            <Eye className="h-4 w-4" />
          </AdminActionButton>
          <AdminActionButton
            variant="outline"
            size="sm"
            onClick={() => router.push(`/admin/championships/${item.id}/edit`)}
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
          <AdminActionButton icon={Plus} onClick={() => router.push('/admin/championships/new')}>
            Novo Campeonato
          </AdminActionButton>
        }
      />

      <AdminDataTable
        columns={columns}
        data={mockChampionships}
        emptyMessage="Nenhum campeonato encontrado."
      />
    </div>
  );
}
