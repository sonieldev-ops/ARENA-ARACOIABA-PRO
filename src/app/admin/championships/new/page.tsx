'use client';

import { Save, ArrowLeft } from 'lucide-react';
import { AdminPageHeader } from '@/src/modules/admin/components/AdminPageHeader';
import { AdminActionButton } from '@/src/modules/admin/components/AdminActionButton';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function NewChampionshipPage() {
  const router = useRouter();

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors cursor-pointer" onClick={() => router.back()}>
        <ArrowLeft className="h-4 w-4" />
        <span className="text-sm font-bold">Voltar</span>
      </div>

      <AdminPageHeader
        title="Novo Campeonato"
        subtitle="Preencha os dados básicos para criar uma nova competição."
        action={
          <AdminActionButton icon={Save} onClick={() => router.push('/admin/championships')}>
            Criar Campeonato
          </AdminActionButton>
        }
      />

      <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 space-y-6">
        <div className="space-y-2">
          <Label className="text-slate-400 font-bold">NOME DO CAMPEONATO</Label>
          <Input placeholder="Ex: Série Ouro 2024" className="bg-slate-900 border-slate-800 rounded-xl" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-slate-400 font-bold">TEMPORADA</Label>
            <Input placeholder="2024" className="bg-slate-900 border-slate-800 rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label className="text-slate-400 font-bold">CIDADE</Label>
            <Input defaultValue="Araçoiaba da Serra" className="bg-slate-900 border-slate-800 rounded-xl" />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-slate-400 font-bold">DESCRIÇÃO (OPCIONAL)</Label>
          <textarea
            className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-sm text-slate-300 min-h-[100px] focus:outline-none focus:ring-1 focus:ring-red-600"
            placeholder="Detalhes sobre o regulamento, premiação, etc."
          />
        </div>
      </div>
    </div>
  );
}
