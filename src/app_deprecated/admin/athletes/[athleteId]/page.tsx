'use client';

import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Edit2, User, Shield, Calendar, Hash } from 'lucide-react';
import { AdminPageHeader } from '@/src/modules/admin/components/AdminPageHeader';
import { AdminActionButton } from '@/src/modules/admin/components/AdminActionButton';
import { AdminStatusBadge } from '@/src/modules/admin/components/AdminStatusBadge';

export default function AthleteDetailPage() {
  const { athleteId } = useParams();
  const router = useRouter();

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors cursor-pointer" onClick={() => router.back()}>
        <ArrowLeft className="h-4 w-4" />
        <span className="text-sm font-bold">Voltar</span>
      </div>

      <AdminPageHeader
        title="Ricardo Oliveira"
        subtitle={`ID: ${athleteId}`}
        action={
          <AdminActionButton icon={Edit2} onClick={() => router.push(`/admin/atletas/${athleteId}/edit`)}>
            Editar Atleta
          </AdminActionButton>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center gap-3 text-slate-400">
            <Shield className="h-5 w-5" />
            <span className="text-sm font-bold uppercase tracking-wider">Time</span>
          </div>
          <p className="text-lg font-black text-white">EC Araçoiaba</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center gap-3 text-slate-400">
            <User className="h-5 w-5" />
            <span className="text-sm font-bold uppercase tracking-wider">Posição</span>
          </div>
          <p className="text-lg font-black text-white">Atacante</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center gap-3 text-slate-400">
            <Hash className="h-5 w-5" />
            <span className="text-sm font-bold uppercase tracking-wider">Camisa</span>
          </div>
          <p className="text-2xl font-black text-white">9</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center gap-3 text-slate-400">
            <Calendar className="h-5 w-5" />
            <span className="text-sm font-bold uppercase tracking-wider">Status</span>
          </div>
          <div>
            <AdminStatusBadge status="ACTIVE" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8">
          <h3 className="text-xl font-black text-white mb-6">Estatísticas na Temporada</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800">
              <p className="text-xs font-bold text-slate-500 uppercase">Gols</p>
              <p className="text-2xl font-black text-red-500">12</p>
            </div>
            <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800">
              <p className="text-xs font-bold text-slate-500 uppercase">Partidas</p>
              <p className="text-2xl font-black text-white">4</p>
            </div>
            <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800">
              <p className="text-xs font-bold text-slate-500 uppercase">Cartões A.</p>
              <p className="text-2xl font-black text-amber-500">1</p>
            </div>
            <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800">
              <p className="text-xs font-bold text-slate-500 uppercase">Cartões V.</p>
              <p className="text-2xl font-black text-red-600">0</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8">
          <h3 className="text-xl font-black text-white mb-6">Informações Pessoais</h3>
          <div className="space-y-4">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase">CPF</p>
              <p className="text-white font-medium">***.***.***-00</p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase">Data de Nascimento</p>
              <p className="text-white font-medium">15/05/1995</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
