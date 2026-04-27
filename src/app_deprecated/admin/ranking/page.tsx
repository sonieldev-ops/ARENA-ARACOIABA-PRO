'use client';

import { useState, useEffect } from 'react';
import { AdminPageHeader } from '@/src/modules/admin/components/AdminPageHeader';
import { AdminDataTable } from '@/src/modules/admin/components/AdminDataTable';
import { AdminActionButton } from '@/src/modules/admin/components/AdminActionButton';
import { Trophy, RefreshCw, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function RankingPage() {
  const [championships, setChampionships] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [ranking, setRanking] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetch('/api/admin/championships')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setChampionships(data);
          if (data.length > 0) setSelectedId(data[0].id);
        }
      });
  }, []);

  useEffect(() => {
    if (selectedId) fetchRanking();
  }, [selectedId]);

  const fetchRanking = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/ranking?championshipId=${selectedId}`);
      const data = await res.json();
      setRanking(data);
    } catch (error) {
      toast.error('Erro ao carregar ranking');
    } finally {
      setLoading(false);
    }
  };

  const handleRecalculate = async () => {
    setRefreshing(true);
    try {
      const res = await fetch(`/api/admin/ranking/recalculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ championshipId: selectedId })
      });
      if (res.ok) {
        toast.success('Ranking recalculado com sucesso!');
        fetchRanking();
      }
    } catch (error) {
      toast.error('Erro ao recalcular');
    } finally {
      setRefreshing(false);
    }
  };

  const columns = [
    {
      header: 'Pos',
      cell: (item: any) => {
        const index = ranking.indexOf(item);
        return <span className="font-bold text-slate-500">#{index + 1}</span>;
      },
      className: 'w-12'
    },
    { header: 'Time', accessorKey: 'teamName', className: 'font-bold text-white' },
    { header: 'P', accessorKey: 'points', className: 'text-center font-black text-red-500' },
    { header: 'J', accessorKey: 'played', className: 'text-center' },
    { header: 'V', accessorKey: 'wins', className: 'text-center' },
    { header: 'E', accessorKey: 'draws', className: 'text-center' },
    { header: 'D', accessorKey: 'losses', className: 'text-center' },
    { header: 'GP', accessorKey: 'goalsFor', className: 'text-center' },
    { header: 'GC', accessorKey: 'goalsAgainst', className: 'text-center' },
    { header: 'SG', accessorKey: 'goalDifference', className: 'text-center font-bold' },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Classificação"
        subtitle="Visualize e gerencie a tabela de pontos dos campeonatos."
        action={
          <AdminActionButton
            icon={refreshing ? Loader2 : RefreshCw}
            onClick={handleRecalculate}
            disabled={refreshing || !selectedId}
            className={refreshing ? 'animate-spin' : ''}
          >
            Recalcular Ranking
          </AdminActionButton>
        }
      />

      <div className="flex gap-4 items-center bg-slate-900/50 p-4 border border-slate-800 rounded-2xl">
        <Trophy className="h-5 w-5 text-amber-500" />
        <select
          className="bg-transparent border-none text-white focus:ring-0 outline-none font-bold"
          value={selectedId}
          onChange={e => setSelectedId(e.target.value)}
        >
          {championships.map(c => <option key={c.id} value={c.id} className="bg-slate-900">{c.name}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-red-600" /></div>
      ) : (
        <AdminDataTable
          columns={columns}
          data={ranking}
          emptyMessage="Nenhum dado de ranking disponível."
        />
      )}
    </div>
  );
}
