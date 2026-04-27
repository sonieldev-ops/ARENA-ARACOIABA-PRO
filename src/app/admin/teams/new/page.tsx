'use client';

import { Save, ArrowLeft } from 'lucide-react';
import { AdminPageHeader } from '@/src/modules/admin/components/AdminPageHeader';
import { AdminActionButton } from '@/src/modules/admin/components/AdminActionButton';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function NewTeamPage() {
  const router = useRouter();

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors cursor-pointer" onClick={() => router.back()}>
        <ArrowLeft className="h-4 w-4" />
        <span className="text-sm font-bold">Voltar</span>
      </div>

      <AdminPageHeader
        title="Novo Time"
        subtitle="Cadastre um novo time no sistema."
        action={
          <AdminActionButton icon={Save} onClick={() => router.push('/admin/teams')}>
            Criar Time
          </AdminActionButton>
        }
      />

      <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 space-y-6">
        <div className="space-y-2">
          <Label className="text-slate-400 font-bold">NOME DO TIME</Label>
          <Input placeholder="Ex: Esporte Clube Araçoiaba" className="bg-slate-900 border-slate-800 rounded-xl" />
        </div>

        <div className="space-y-2">
          <Label className="text-slate-400 font-bold">CAMPEONATO</Label>
          <select className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-sm text-slate-300">
            <option>Série Ouro 2024</option>
            <option>Série Prata 2024</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label className="text-slate-400 font-bold">CIDADE</Label>
          <Input defaultValue="Araçoiaba da Serra" className="bg-slate-900 border-slate-800 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
