'use client';

import { Plus, Eye, Edit2 } from 'lucide-react';
import { AdminPageHeader } from '@/src/modules/admin/components/AdminPageHeader';
import { AdminActionButton } from '@/src/modules/admin/components/AdminActionButton';
import { AdminDataTable } from '@/src/modules/admin/components/AdminDataTable';
import { AdminStatusBadge } from '@/src/modules/admin/components/AdminStatusBadge';
import { useRouter } from 'next/navigation';

interface Team {
  id: string;
  name: string;
  championship: string;
  city: string;
  status: string;
}

const mockTeams: Team[] = [
  { id: '1', name: 'Esporte Clube Araçoiaba', championship: 'Série Ouro 2024', city: 'Araçoiaba', status: 'ACTIVE' },
  { id: '2', name: 'Vila Real FC', championship: 'Série Ouro 2024', city: 'Araçoiaba', status: 'ACTIVE' },
  { id: '3', name: 'União da Vila', championship: 'Série Prata 2023', city: 'Araçoiaba', status: 'INACTIVE' },
];

export default function TeamsPage() {
  const router = useRouter();

  const columns = [
    { header: 'Nome', accessorKey: 'name' as keyof Team, className: 'font-bold text-white' },
    { header: 'Campeonato', accessorKey: 'championship' as keyof Team },
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
            size="sm"
            onClick={() => router.push(`/admin/teams/${item.id}`)}
          >
            <Eye className="h-4 w-4" />
          </AdminActionButton>
          <AdminActionButton
            variant="outline"
            size="sm"
            onClick={() => router.push(`/admin/teams/${item.id}/edit`)}
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
          <AdminActionButton icon={Plus} onClick={() => router.push('/admin/teams/new')}>
            Novo Time
          </AdminActionButton>
        }
      />

      <AdminDataTable
        columns={columns}
        data={mockTeams}
        emptyMessage="Nenhum time encontrado."
      />
    </div>
  );
}
