'use client';

import { Save, ArrowLeft } from 'lucide-react';
import { AdminPageHeader } from '@/src/modules/admin/components/AdminPageHeader';
import { AdminActionButton } from '@/src/modules/admin/components/AdminActionButton';
import { useRouter, useParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function EditMatchPage() {
  const router = useRouter();
  const { matchId } = useParams();

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors cursor-pointer" onClick={() => router.back()}>
        <ArrowLeft className="h-4 w-4" />
        <span className="text-sm font-bold">Voltar</span>
      </div>

      <AdminPageHeader
        title="Editar Partida"
        subtitle={`Editando: ${matchId}`}
        action={
          <AdminActionButton icon={Save} onClick={() => router.push('/admin/partidas')}>
            Salvar Alterações
          </AdminActionButton>
        }
      />

      <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 space-y-6">
        <div className="space-y-2">
          <Label className="text-slate-400 font-bold">CAMPEONATO</Label>
          <select className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-sm text-slate-300">
            <option selected>Série Ouro 2024</option>
            <option>Série Prata 2024</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-slate-400 font-bold">TIME A (LOCAL)</Label>
            <select className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-sm text-slate-300">
              <option selected>EC Araçoiaba</option>
              <option>Vila Real FC</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label className="text-slate-400 font-bold">TIME B (VISITANTE)</Label>
            <select className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-sm text-slate-300">
              <option>EC Araçoiaba</option>
              <option selected>Vila Real FC</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-slate-400 font-bold">DATA</Label>
            <Input type="date" defaultValue="2024-05-10" className="bg-slate-900 border-slate-800 rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label className="text-slate-400 font-bold">HORÁRIO</Label>
            <Input type="time" defaultValue="20:00" className="bg-slate-900 border-slate-800 rounded-xl" />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-slate-400 font-bold">STATUS</Label>
          <select className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-sm text-slate-300">
            <option value="SCHEDULED">Agendada</option>
            <option value="LIVE">Ao Vivo</option>
            <option value="FINISHED" selected>Finalizada</option>
            <option value="CANCELED">Cancelada</option>
          </select>
        </div>
      </div>
    </div>
  );
}
