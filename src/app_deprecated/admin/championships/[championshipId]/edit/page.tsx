'use client';

import { Save, ArrowLeft } from 'lucide-react';
import { AdminPageHeader } from '@/src/modules/admin/components/AdminPageHeader';
import { AdminActionButton } from '@/src/modules/admin/components/AdminActionButton';
import { useRouter, useParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function EditChampionshipPage() {
  const router = useRouter();
  const { championshipId } = useParams();

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors cursor-pointer" onClick={() => router.back()}>
        <ArrowLeft className="h-4 w-4" />
        <span className="text-sm font-bold">Voltar</span>
      </div>

      <AdminPageHeader
        title="Editar Campeonato"
        subtitle={`Editando: ${championshipId}`}
        action={
          <AdminActionButton icon={Save} onClick={() => router.push('/admin/campeonatos')}>
            Salvar Alterações
          </AdminActionButton>
        }
      />

      <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 space-y-6">
        <div className="space-y-2">
          <Label className="text-slate-400 font-bold">NOME DO CAMPEONATO</Label>
          <Input defaultValue="Série Ouro 2024" className="bg-slate-900 border-slate-800 rounded-xl" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-slate-400 font-bold">TEMPORADA</Label>
            <Input defaultValue="2024" className="bg-slate-900 border-slate-800 rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label className="text-slate-400 font-bold">CIDADE</Label>
            <Input defaultValue="Arena Pro" className="bg-slate-900 border-slate-800 rounded-xl" />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-slate-400 font-bold">STATUS</Label>
          <select className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-sm text-slate-300">
            <option value="ACTIVE">Ativo</option>
            <option value="SCHEDULED">Agendado</option>
            <option value="FINISHED">Finalizado</option>
          </select>
        </div>
      </div>
    </div>
  );
}
