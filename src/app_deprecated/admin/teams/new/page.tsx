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

export default function NewTeamPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [championships, setChampionships] = useState<Championship[]>([]);
  const [loadingChamps, setLoadingChamps] = useState(true);

  const [formData, setFormData] = useState({
    name: '',
    championshipId: '',
    city: 'Araçoiaba da Serra',
    status: 'ACTIVE' as const
  });

  useEffect(() => {
    fetch('/api/admin/championships')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setChampionships(data);
          if (data.length > 0) {
            setFormData(prev => ({ ...prev, championshipId: data[0].id }));
          }
        }
      })
      .catch(err => {
        console.error('Erro ao carregar campeonatos:', err);
        toast.error('Erro ao carregar lista de campeonatos');
      })
      .finally(() => setLoadingChamps(false));
  }, []);

  const handleSave = async () => {
    if (!formData.name || !formData.championshipId) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    setLoading(true);
    try {
      const selectedChamp = championships.find(c => c.id === formData.championshipId);

      const response = await fetch('/api/admin/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          championshipName: selectedChamp?.name || ''
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao salvar time');
      }

      toast.success('Time cadastrado com sucesso!');
      router.push('/admin/times');
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
        title="Novo Time"
        subtitle="Cadastre um novo time no sistema."
        action={
          <AdminActionButton
            icon={loading ? Loader2 : Save}
            onClick={handleSave}
            disabled={loading || loadingChamps}
          >
            {loading ? 'Salvando...' : 'Criar Time'}
          </AdminActionButton>
        }
      />

      <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 space-y-6">
        <div className="space-y-2">
          <Label className="text-slate-400 font-bold uppercase tracking-wider text-xs">Nome do Time</Label>
          <Input
            placeholder="Ex: Esporte Clube Araçoiaba"
            className="bg-slate-900 border-slate-800 rounded-xl"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-slate-400 font-bold uppercase tracking-wider text-xs">Campeonato</Label>
          <select
            className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-sm text-slate-300 focus:ring-2 focus:ring-red-500 outline-none"
            value={formData.championshipId}
            onChange={e => setFormData({ ...formData, championshipId: e.target.value })}
            disabled={loadingChamps}
          >
            {loadingChamps ? (
              <option>Carregando campeonatos...</option>
            ) : championships.length === 0 ? (
              <option>Nenhum campeonato cadastrado</option>
            ) : (
              championships.map(champ => (
                <option key={champ.id} value={champ.id}>{champ.name}</option>
              ))
            )}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-slate-400 font-bold uppercase tracking-wider text-xs">Cidade</Label>
            <Input
              placeholder="Araçoiaba da Serra"
              className="bg-slate-900 border-slate-800 rounded-xl"
              value={formData.city}
              onChange={e => setFormData({ ...formData, city: e.target.value })}
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
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
