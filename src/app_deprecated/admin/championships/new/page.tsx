'use client';

import { Save, ArrowLeft, Loader2 } from 'lucide-react';
import { AdminPageHeader } from '@/src/modules/admin/components/AdminPageHeader';
import { AdminActionButton } from '@/src/modules/admin/components/AdminActionButton';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { toast } from 'sonner';

export default function NewChampionshipPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    season: '2024',
    city: 'Arena Pro',
    description: '',
    status: 'ACTIVE' as const
  });

  const handleSave = async () => {
    if (!formData.name || !formData.season) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/admin/championships', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao salvar campeonato');
      }

      toast.success('Campeonato criado com sucesso!');
      router.push('/admin/campeonatos');
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
        title="Novo Campeonato"
        subtitle="Preencha os dados básicos para criar uma nova competição."
        action={
          <AdminActionButton
            icon={loading ? Loader2 : Save}
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? 'Criando...' : 'Criar Campeonato'}
          </AdminActionButton>
        }
      />

      <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 space-y-6">
        <div className="space-y-2">
          <Label className="text-slate-400 font-bold uppercase tracking-wider text-xs">Nome do Campeonato</Label>
          <Input
            placeholder="Ex: Série Ouro 2024"
            className="bg-slate-900 border-slate-800 rounded-xl"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-slate-400 font-bold uppercase tracking-wider text-xs">Temporada</Label>
            <Input
              placeholder="2024"
              className="bg-slate-900 border-slate-800 rounded-xl"
              value={formData.season}
              onChange={e => setFormData({ ...formData, season: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-slate-400 font-bold uppercase tracking-wider text-xs">Cidade</Label>
            <Input
              placeholder="Arena Pro"
              className="bg-slate-900 border-slate-800 rounded-xl"
              value={formData.city}
              onChange={e => setFormData({ ...formData, city: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-slate-400 font-bold uppercase tracking-wider text-xs">Descrição (Opcional)</Label>
          <textarea
            className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-sm text-slate-300 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
            placeholder="Detalhes sobre o regulamento, premiação, etc."
            value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-slate-400 font-bold uppercase tracking-wider text-xs">Status Inicial</Label>
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
  );
}
