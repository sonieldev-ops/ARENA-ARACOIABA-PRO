'use client';

import { useState, useEffect } from 'react';
import { Plus, Eye, Edit2, Loader2 } from 'lucide-react';
import { AdminPageHeader } from '@/src/modules/admin/components/AdminPageHeader';
import { AdminActionButton } from '@/src/modules/admin/components/AdminActionButton';
import { AdminDataTable } from '@/src/modules/admin/components/AdminDataTable';
import { AdminStatusBadge } from '@/src/modules/admin/components/AdminStatusBadge';
import { useRouter } from 'next/navigation';

interface Athlete {
  id: string;
  name: string;
  teamName: string;
  position: string;
  number: string;
  status: string;
}

export default function AthletesPage() {
  const router = useRouter();
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/athletes')
      .then(res => res.json())
      .then(data => {
        setAthletes(data);
        setLoading(false);
      });
  }, []);

  const columns = [
    { header: 'Nome', accessorKey: 'name' as keyof Athlete, className: 'font-bold text-white' },
    { header: 'Time', accessorKey: 'teamName' as keyof Athlete },
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
            onClick={() => router.push(`/admin/atletas/${item.id}`)}
          >
            <Eye className="h-4 w-4" />
          </AdminActionButton>
          <AdminActionButton
            variant="outline"
            size="sm"
            onClick={() => router.push(`/admin/atletas/${item.id}/edit`)}
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
          <AdminActionButton icon={Plus} onClick={() => router.push('/admin/atletas/new')}>
            Novo Atleta
          </AdminActionButton>
        }
      />

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-red-600" /></div>
      ) : (
        <AdminDataTable
          columns={columns}
          data={athletes}
          emptyMessage="Nenhum atleta encontrado."
        />
      )}
    </div>
  );
}
