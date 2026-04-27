'use client';

import { useState, useEffect } from 'react';
import {
  Play,
  Loader2,
  Calendar,
  ChevronRight,
  Activity
} from 'lucide-react';
import { AdminPageHeader } from '@/src/modules/admin/components/AdminPageHeader';
import { AdminActionButton } from '@/src/modules/admin/components/AdminActionButton';
import { AdminDataTable } from '@/src/modules/admin/components/AdminDataTable';
import { AdminStatusBadge } from '@/src/modules/admin/components/AdminStatusBadge';
import { useRouter } from 'next/navigation';

export default function LiveControlSelectionPage() {
  const router = useRouter();
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/matches')
      .then(res => res.json())
      .then(data => {
        setMatches(data.filter((m: any) => m.status === 'LIVE' || m.status === 'SCHEDULED'));
        setLoading(false);
      });
  }, []);

  const columns = [
    {
      header: 'Partida',
      cell: (item: any) => {
        const safeString = (val: any) => (typeof val === 'string' ? val : (typeof val === 'number' ? String(val) : ''));
        const nameA = safeString(item.teamAName) || 'Time A';
        const nameB = safeString(item.teamBName) || 'Time B';

        return (
          <div className="flex items-center gap-3 font-bold text-white">
            <span>{nameA}</span>
            <span className="text-slate-500 font-normal">vs</span>
            <span>{nameB}</span>
          </div>
        );
      }
    },
    {
      header: 'Status',
      cell: (item: any) => {
        const status = typeof item.status === 'string' ? item.status : 'PENDING';
        return <AdminStatusBadge status={status} />;
      }
    },
    {
      header: 'Ações',
      className: 'text-right',
      cell: (item: any) => (
        <AdminActionButton
          variant={item.status === 'LIVE' ? "default" : "outline"}
          size="sm"
          onClick={() => router.push(`/admin/live-control/${item.id}`)}
        >
          {item.status === 'LIVE' ? <Activity className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
          Controlar
        </AdminActionButton>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Controle Ao Vivo"
        subtitle="Selecione uma partida em andamento ou agendada para gerenciar."
      />

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-red-600" /></div>
      ) : (
        <AdminDataTable
          columns={columns}
          data={matches}
          emptyMessage="Nenhuma partida disponível para controle no momento."
        />
      )}
    </div>
  );
}
