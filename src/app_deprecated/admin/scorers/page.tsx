'use client';

import { useState, useEffect } from 'react';
import { AdminPageHeader } from '@/src/modules/admin/components/AdminPageHeader';
import { AdminDataTable } from '@/src/modules/admin/components/AdminDataTable';
import { AdminActionButton } from '@/src/modules/admin/components/AdminActionButton';
import { Target, RefreshCw, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ScorersPage() {
  const [championships, setChampionships] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [scorers, setScorers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

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
    if (selectedId) fetchScorers();
  }, [selectedId]);

  const fetchScorers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/scorers?championshipId=${selectedId}`);
      const data = await res.json();
      setScorers(data);
    } catch (error) {
      toast.error('Erro ao carregar artilharia');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      header: 'Pos',
      cell: (item: any) => {
        const index = scorers.indexOf(item);
        return <span className="font-bold text-slate-500">#{index + 1}</span>;
      },
      className: 'w-12'
    },
    { header: 'Atleta', accessorKey: 'athleteName', className: 'font-bold text-white' },
    { header: 'Time', accessorKey: 'teamName', className: 'text-slate-400' },
    { header: 'Gols', accessorKey: 'goals', className: 'text-center font-black text-2xl text-red-500' },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Artilharia"
        subtitle="Ranking de jogadores com mais gols no campeonato."
      />

      <div className="flex gap-4 items-center bg-slate-900/50 p-4 border border-slate-800 rounded-2xl">
        <Target className="h-5 w-5 text-red-500" />
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
          data={scorers}
          emptyMessage="Nenhum gol registrado ainda."
        />
      )}
    </div>
  );
}
