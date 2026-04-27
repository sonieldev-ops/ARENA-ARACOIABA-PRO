'use client';

import { Save, ArrowLeft, Loader2 } from 'lucide-react';
import { AdminPageHeader } from '@/src/modules/admin/components/AdminPageHeader';
import { AdminActionButton } from '@/src/modules/admin/components/AdminActionButton';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface Team {
  id: string;
  name: string;
}

export default function NewAthletePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loadingTeams, setLoadingTeams] = useState(true);

  const [formData, setFormData] = useState({
    name: '',
    teamId: '',
    position: 'Ala',
    number: '',
    status: 'ACTIVE' as const
  });

  useEffect(() => {
    fetch('/api/admin/teams')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setTeams(data);
          if (data.length > 0) {
            setFormData(prev => ({ ...prev, teamId: data[0].id }));
          }
        }
      })
      .catch(err => {
        console.error('Erro ao carregar times:', err);
        toast.error('Erro ao carregar lista de times');
      })
      .finally(() => setLoadingTeams(false));
  }, []);

  const handleSave = async () => {
    if (!formData.name || !formData.teamId || !formData.number) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    setLoading(true);
    try {
      const selectedTeam = teams.find(t => t.id === formData.teamId);

      const response = await fetch('/api/admin/athletes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          teamName: selectedTeam?.name || ''
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao salvar atleta');
      }

      toast.success('Atleta cadastrado com sucesso!');
      router.push('/admin/atletas');
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
        title="Novo Atleta"
        subtitle="Cadastre um novo atleta e vincule a um time."
        action={
          <AdminActionButton
            icon={loading ? Loader2 : Save}
            onClick={handleSave}
            disabled={loading || loadingTeams}
            className={loading ? "animate-pulse" : ""}
          >
            {loading ? 'Salvando...' : 'Salvar Atleta'}
          </AdminActionButton>
        }
      />

      <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 space-y-6">
        <div className="space-y-2">
          <Label className="text-slate-400 font-bold uppercase tracking-wider text-xs">Nome Completo</Label>
          <Input
            placeholder="Ex: Ricardo Oliveira"
            className="bg-slate-900 border-slate-800 rounded-xl"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-slate-400 font-bold uppercase tracking-wider text-xs">Time</Label>
            <select
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-sm text-slate-300 focus:ring-2 focus:ring-red-500 outline-none"
              value={formData.teamId}
              onChange={e => setFormData({ ...formData, teamId: e.target.value })}
              disabled={loadingTeams}
            >
              {loadingTeams ? (
                <option>Carregando times...</option>
              ) : teams.length === 0 ? (
                <option>Nenhum time cadastrado</option>
              ) : (
                teams.map(team => (
                  <option key={team.id} value={team.id}>{team.name}</option>
                ))
              )}
            </select>
          </div>
          <div className="space-y-2">
            <Label className="text-slate-400 font-bold uppercase tracking-wider text-xs">Posição</Label>
            <select
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-sm text-slate-300 focus:ring-2 focus:ring-red-500 outline-none"
              value={formData.position}
              onChange={e => setFormData({ ...formData, position: e.target.value })}
            >
              <option value="Goleiro">Goleiro</option>
              <option value="Fixo">Fixo</option>
              <option value="Ala">Ala</option>
              <option value="Pivô">Pivô</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-slate-400 font-bold uppercase tracking-wider text-xs">Número da Camisa</Label>
            <Input
              type="number"
              placeholder="10"
              className="bg-slate-900 border-slate-800 rounded-xl"
              value={formData.number}
              onChange={e => setFormData({ ...formData, number: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-slate-400 font-bold uppercase tracking-wider text-xs">Status</Label>
            <select
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-sm text-slate-300 focus:ring-2 focus:ring-red-500 outline-none"
              value={formData.status}
              onChange={e => setFormData({ ...formData, status: e.target.value as any })}
            >
              <option value="ACTIVE">Ativo</option>
              <option value="INACTIVE">Inativo</option>
              <option value="SUSPENDED">Suspenso</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
