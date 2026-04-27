'use client';

import { useState, useEffect } from 'react';
import { Plus, Eye, Edit2, Activity, Loader2 } from 'lucide-react';
import { AdminPageHeader } from '@/src/modules/admin/components/AdminPageHeader';
import { AdminActionButton } from '@/src/modules/admin/components/AdminActionButton';
import { AdminDataTable } from '@/src/modules/admin/components/AdminDataTable';
import { AdminStatusBadge } from '@/src/modules/admin/components/AdminStatusBadge';
import { useRouter } from 'next/navigation';
import { formatFirebaseDate } from '@/src/lib/utils';

interface Match {
  id: string;
  competitionId: string;
  teamAName: string;
  teamBName: string;
  scoreA: number;
  scoreB: number;
  status: string;
  date: any;
}

export default function MatchesPage() {
  const router = useRouter();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/matches')
      .then(res => res.json())
      .then(data => {
        setMatches(data);
        setLoading(false);
      });
  }, []);

  const columns = [
    {
      header: 'Campeonato',
      cell: (item: Match) => {
        const id = item.championshipId || item.competitionId;
        return typeof id === 'string' ? id : 'ID Inválido';
      }
    },
    {
      header: 'Partida',
      cell: (item: Match) => {
        const renderScore = (score: any) => {
          if (typeof score === 'number') return score;
          if (typeof score === 'string') return score;
          return '0';
        };

        const safeName = (name: any) => typeof name === 'string' ? name : 'Time s/ Nome';

        return (
          <div className="flex items-center gap-3 font-bold text-white">
            <span>{safeName(item.teamAName)}</span>
            <span className="text-red-600 px-2 py-0.5 bg-red-600/10 rounded text-xs">
              {renderScore(item.scoreA)} x {renderScore(item.scoreB)}
            </span>
            <span>{safeName(item.teamBName)}</span>
          </div>
        );
      }
    },
    {
      header: 'Data/Hora',
      cell: (item: Match) => formatFirebaseDate(item.date) || '-'
    },
    {
      header: 'Status',
      cell: (item: Match) => {
        const status = typeof item.status === 'string' ? item.status : 'UNKNOWN';
        return <AdminStatusBadge status={status} />;
      }
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
            onClick={() => router.push(`/admin/partidas/${item.id}`)}
          >
            <Eye className="h-4 w-4" />
          </AdminActionButton>
          <AdminActionButton
            variant="outline"
            size="sm"
            onClick={() => router.push(`/admin/partidas/${item.id}/edit`)}
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
          <AdminActionButton icon={Plus} onClick={() => router.push('/admin/partidas/new')}>
            Nova Partida
          </AdminActionButton>
        }
      />

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-red-600" /></div>
      ) : (
        <AdminDataTable
          columns={columns}
          data={matches}
          emptyMessage="Nenhuma partida encontrada."
        />
      )}
    </div>
  );
}
