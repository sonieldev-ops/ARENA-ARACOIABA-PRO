'use client';

import { Save, ArrowLeft } from 'lucide-react';
import { AdminPageHeader } from '@/src/modules/admin/components/AdminPageHeader';
import { AdminActionButton } from '@/src/modules/admin/components/AdminActionButton';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function NewAthletePage() {
  const router = useRouter();

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors cursor-pointer" onClick={() => router.back()}>
        <ArrowLeft className="h-4 w-4" />
        <span className="text-sm font-bold">Voltar</span>
      </div>

      <AdminPageHeader
        title="Novo Atleta"
        subtitle="Cadastre um novo atleta e vincule a um time."
        action={
          <AdminActionButton icon={Save} onClick={() => router.push('/admin/athletes')}>
            Salvar Atleta
          </AdminActionButton>
        }
      />

      <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 space-y-6">
        <div className="space-y-2">
          <Label className="text-slate-400 font-bold">NOME COMPLETO</Label>
          <Input placeholder="Ex: Ricardo Oliveira" className="bg-slate-900 border-slate-800 rounded-xl" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-slate-400 font-bold">TIME</Label>
            <select className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-sm text-slate-300">
              <option>Esporte Clube Araçoiaba</option>
              <option>Vila Real FC</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label className="text-slate-400 font-bold">POSIÇÃO</Label>
            <select className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-sm text-slate-300">
              <option>Goleiro</option>
              <option>Fixo</option>
              <option>Ala</option>
              <option>Pivô</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-slate-400 font-bold">NÚMERO DA CAMISA</Label>
            <Input type="number" placeholder="10" className="bg-slate-900 border-slate-800 rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label className="text-slate-400 font-bold">CPF (OPCIONAL)</Label>
            <Input placeholder="000.000.000-00" className="bg-slate-900 border-slate-800 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
