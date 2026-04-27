'use client';

import { Save, ArrowLeft, Loader2 } from 'lucide-react';
import { AdminPageHeader } from '@/src/modules/admin/components/AdminPageHeader';
import { AdminActionButton } from '@/src/modules/admin/components/AdminActionButton';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface Championship {
  id: string;
  name: string;
}

interface Team {
  id: string;
  name: string;
  championshipId: string;
}

export default function NewMatchPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [championships, setChampionships] = useState<Championship[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [filteredTeams, setFilteredTeams] = useState<Team[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const [formData, setFormData] = useState({
    competitionId: '',
    teamAId: '',
    teamBId: '',
    date: '',
    time: '',
    location: 'Ginásio Municipal'
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const [champsRes, teamsRes] = await Promise.all([
          fetch('/api/admin/championships'),
          fetch('/api/admin/teams')
        ]);

        const champs = await champsRes.json();
        const tms = await teamsRes.json();

        if (Array.isArray(champs)) setChampionships(champs);
        if (Array.isArray(tms)) setTeams(tms);

        if (champs.length > 0) {
          setFormData(prev => ({ ...prev, competitionId: champs[0].id }));
        }
      } catch (error) {
        toast.error('Erro ao carregar dados');
      } finally {
        setLoadingData(false);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    const filtered = teams.filter(t => t.championshipId === formData.competitionId);
    setFilteredTeams(filtered);
    if (filtered.length >= 2) {
      setFormData(prev => ({ ...prev, teamAId: filtered[0].id, teamBId: filtered[1].id }));
    }
  }, [formData.competitionId, teams]);

  const handleSave = async () => {
    if (!formData.teamAId || !formData.teamBId || !formData.date || !formData.time) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    if (formData.teamAId === formData.teamBId) {
      toast.error('Selecione times diferentes');
      return;
    }

    setLoading(true);
    try {
      const teamA = teams.find(t => t.id === formData.teamAId);
      const teamB = teams.find(t => t.id === formData.teamBId);

      const matchDate = new Date(`${formData.date}T${formData.time}`);

      const response = await fetch('/api/admin/matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          teamAName: teamA?.name,
          teamBName: teamB?.name,
          date: matchDate.toISOString()
        }),
      });

      if (!response.ok) throw new Error('Erro ao agendar partida');

      toast.success('Partida agendada com sucesso!');
      router.push('/admin/partidas');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors cursor-pointer" onClick={() => router.back()}>
        <ArrowLeft className="h-4 w-4" />
        <span className="text-sm font-bold">Voltar</span>
      </div>

      <AdminPageHeader
        title="Nova Partida"
        subtitle="Agende um novo confronto entre dois times."
        action={
          <AdminActionButton
            icon={loading ? Loader2 : Save}
            onClick={handleSave}
            disabled={loading || loadingData}
          >
            {loading ? 'Salvando...' : 'Agendar Partida'}
          </AdminActionButton>
        }
      />

      <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 space-y-6">
        <div className="space-y-2">
          <Label className="text-slate-400 font-bold uppercase tracking-wider text-xs">Campeonato</Label>
          <select
            className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-sm text-slate-300 focus:ring-2 focus:ring-red-500 outline-none"
            value={formData.competitionId}
            onChange={e => setFormData({ ...formData, competitionId: e.target.value })}
          >
            {championships.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-slate-400 font-bold uppercase tracking-wider text-xs">Time A (Local)</Label>
            <select
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-sm text-slate-300 focus:ring-2 focus:ring-red-500 outline-none"
              value={formData.teamAId}
              onChange={e => setFormData({ ...formData, teamAId: e.target.value })}
            >
              {filteredTeams.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label className="text-slate-400 font-bold uppercase tracking-wider text-xs">Time B (Visitante)</Label>
            <select
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-sm text-slate-300 focus:ring-2 focus:ring-red-500 outline-none"
              value={formData.teamBId}
              onChange={e => setFormData({ ...formData, teamBId: e.target.value })}
            >
              {filteredTeams.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-slate-400 font-bold uppercase tracking-wider text-xs">Data</Label>
            <Input
              type="date"
              className="bg-slate-900 border-slate-800 rounded-xl"
              value={formData.date}
              onChange={e => setFormData({ ...formData, date: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-slate-400 font-bold uppercase tracking-wider text-xs">Horário</Label>
            <Input
              type="time"
              className="bg-slate-900 border-slate-800 rounded-xl"
              value={formData.time}
              onChange={e => setFormData({ ...formData, time: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-slate-400 font-bold uppercase tracking-wider text-xs">Local / Estádio</Label>
          <Input
            className="bg-slate-900 border-slate-800 rounded-xl"
            value={formData.location}
            onChange={e => setFormData({ ...formData, location: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
}
