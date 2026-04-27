'use client';

import { Plus, Eye, Edit2, Activity } from 'lucide-react';
import { AdminPageHeader } from '@/src/modules/admin/components/AdminPageHeader';
import { AdminActionButton } from '@/src/modules/admin/components/AdminActionButton';
import { AdminDataTable } from '@/src/modules/admin/components/AdminDataTable';
import { AdminStatusBadge } from '@/src/modules/admin/components/AdminStatusBadge';
import { useRouter } from 'next/navigation';

interface Match {
  id: string;
  championship: string;
  teamA: string;
  teamB: string;
  scoreA: number;
  scoreB: number;
  status: string;
  date: string;
}

const mockMatches: Match[] = [
  { id: '1', championship: 'Série Ouro 2024', teamA: 'EC Araçoiaba', teamB: 'Vila Real FC', scoreA: 2, scoreB: 1, status: 'LIVE', date: 'Hoje, 20:00' },
  { id: '2', championship: 'Série Ouro 2024', teamA: 'União da Vila', teamB: 'Palmeirinha', scoreA: 0, scoreB: 0, status: 'SCHEDULED', date: 'Amanhã, 19:00' },
  { id: '3', championship: 'Série Ouro 2024', teamA: 'Juventus', teamB: 'Ajax', scoreA: 3, scoreB: 3, status: 'FINISHED', date: 'Ontem' },
];

export default function MatchesPage() {
  const router = useRouter();

  const columns = [
    { header: 'Campeonato', accessorKey: 'championship' as keyof Match },
    {
      header: 'Partida',
      cell: (item: Match) => (
        <div className="flex items-center gap-3 font-bold text-white">
          <span>{item.teamA}</span>
          <span className="text-red-600 px-2 py-0.5 bg-red-600/10 rounded text-xs">{item.scoreA} x {item.scoreB}</span>
          <span>{item.teamB}</span>
        </div>
      )
    },
    { header: 'Data/Hora', accessorKey: 'date' as keyof Match },
    {
      header: 'Status',
      cell: (item: Match) => <AdminStatusBadge status={item.status} />
    },
    {
      header: 'Ações',
      className: 'text-right',
      cell: (item: Match) => (
        <div className="flex justify-end gap-2">
          {item.status === 'LIVE' && (
            <AdminActionButton
              variant="default"
              size="sm"
              className="bg-red-600/10 text-red-600 hover:bg-red-600 hover:text-white"
              onClick={() => router.push(`/admin/live-control?matchId=${item.id}`)}
            >
              <Activity className="h-4 w-4" />
            </AdminActionButton>
          )}
          <AdminActionButton
            variant="outline"
            size="sm"
            onClick={() => router.push(`/admin/matches/${item.id}`)}
          >
            <Eye className="h-4 w-4" />
          </AdminActionButton>
          <AdminActionButton
            variant="outline"
            size="sm"
            onClick={() => router.push(`/admin/matches/${item.id}/edit`)}
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
        title="Partidas"
        subtitle="Gerencie o calendário e resultados das partidas."
        action={
          <AdminActionButton icon={Plus} onClick={() => router.push('/admin/matches/new')}>
            Nova Partida
          </AdminActionButton>
        }
      />

      <AdminDataTable
        columns={columns}
        data={mockMatches}
        emptyMessage="Nenhuma partida encontrada."
      />
    </div>
  );
}
