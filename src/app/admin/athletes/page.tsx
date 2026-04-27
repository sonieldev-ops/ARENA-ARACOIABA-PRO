'use client';

import { Plus, Eye, Edit2 } from 'lucide-react';
import { AdminPageHeader } from '@/src/modules/admin/components/AdminPageHeader';
import { AdminActionButton } from '@/src/modules/admin/components/AdminActionButton';
import { AdminDataTable } from '@/src/modules/admin/components/AdminDataTable';
import { AdminStatusBadge } from '@/src/modules/admin/components/AdminStatusBadge';
import { useRouter } from 'next/navigation';

interface Athlete {
  id: string;
  name: string;
  team: string;
  position: string;
  number: string;
  status: string;
}

const mockAthletes: Athlete[] = [
  { id: '1', name: 'Ricardo Oliveira', team: 'EC Araçoiaba', position: 'Atacante', number: '9', status: 'ACTIVE' },
  { id: '2', name: 'Marcos Silva', team: 'Vila Real FC', position: 'Meio-Campo', number: '10', status: 'ACTIVE' },
  { id: '3', name: 'João Santos', team: 'União da Vila', position: 'Goleiro', number: '1', status: 'INACTIVE' },
];

export default function AthletesPage() {
  const router = useRouter();

  const columns = [
    { header: 'Nome', accessorKey: 'name' as keyof Athlete, className: 'font-bold text-white' },
    { header: 'Time', accessorKey: 'team' as keyof Athlete },
    { header: 'Posição', accessorKey: 'position' as keyof Athlete },
    { header: 'Camisa', accessorKey: 'number' as keyof Athlete },
    {
      header: 'Status',
      cell: (item: Athlete) => <AdminStatusBadge status={item.status} />
    },
    {
      header: 'Ações',
      className: 'text-right',
      cell: (item: Athlete) => (
        <div className="flex justify-end gap-2">
          <AdminActionButton
            variant="outline"
            size="sm"
            onClick={() => router.push(`/admin/athletes/${item.id}`)}
          >
            <Eye className="h-4 w-4" />
          </AdminActionButton>
          <AdminActionButton
            variant="outline"
            size="sm"
            onClick={() => router.push(`/admin/athletes/${item.id}/edit`)}
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
        title="Atletas"
        subtitle="Gerencie todos os atletas inscritos no sistema."
        action={
          <AdminActionButton icon={Plus} onClick={() => router.push('/admin/athletes/new')}>
            Novo Atleta
          </AdminActionButton>
        }
      />

      <AdminDataTable
        columns={columns}
        data={mockAthletes}
        emptyMessage="Nenhum atleta encontrado."
      />
    </div>
  );
}
