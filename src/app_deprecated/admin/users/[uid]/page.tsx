'use client';

import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Save, Shield, Mail, Calendar, User as UserIcon } from 'lucide-react';
import { AdminPageHeader } from '@/src/modules/admin/components/AdminPageHeader';
import { AdminActionButton } from '@/src/modules/admin/components/AdminActionButton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function UserDetailPage() {
  const { uid } = useParams();
  const router = useRouter();

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors cursor-pointer" onClick={() => router.back()}>
        <ArrowLeft className="h-4 w-4" />
        <span className="text-sm font-bold">Voltar</span>
      </div>

      <AdminPageHeader
        title="Detalhes do Usuário"
        subtitle={`UID: ${uid}`}
        action={
          <AdminActionButton icon={Save} onClick={() => router.push('/admin/usuarios')}>
            Salvar Alterações
          </AdminActionButton>
        }
      />

      <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 space-y-6">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center border-2 border-slate-700">
            <UserIcon className="h-10 w-10 text-slate-500" />
          </div>
          <div>
            <h3 className="text-xl font-black text-white">Admin Arena</h3>
            <p className="text-slate-500 font-medium">admin@arenapro.com</p>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-slate-400 font-bold">NOME EXIBIDO</Label>
          <Input defaultValue="Admin Arena" className="bg-slate-900 border-slate-800 rounded-xl" />
        </div>

        <div className="space-y-2">
          <Label className="text-slate-400 font-bold">NÍVEL DE ACESSO (ROLE)</Label>
          <select className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-sm text-slate-300">
            <option value="SUPER_ADMIN" selected>Super Admin</option>
            <option value="ORGANIZER">Organizador</option>
            <option value="REFEREE">Árbitro</option>
            <option value="STAFF">Staff</option>
            <option value="USER">Usuário Comum</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label className="text-slate-400 font-bold">STATUS DA CONTA</Label>
          <select className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-sm text-slate-300">
            <option value="APPROVED" selected>Aprovado</option>
            <option value="PENDING">Pendente</option>
            <option value="BLOCKED">Bloqueado</option>
          </select>
        </div>

        <div className="pt-4 border-t border-slate-800 flex flex-col gap-3">
          <div className="flex items-center gap-3 text-slate-400">
            <Mail className="h-4 w-4" />
            <span className="text-xs font-bold uppercase tracking-widest">Email verificado: Sim</span>
          </div>
          <div className="flex items-center gap-3 text-slate-400">
            <Calendar className="h-4 w-4" />
            <span className="text-xs font-bold uppercase tracking-widest">Criado em: 01/01/2024</span>
          </div>
        </div>
      </div>
    </div>
  );
}
