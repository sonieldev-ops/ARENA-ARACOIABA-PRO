'use client';

import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Edit2, Trophy, Users, Calendar, MapPin } from 'lucide-react';
import { AdminPageHeader } from '@/src/modules/admin/components/AdminPageHeader';
import { AdminActionButton } from '@/src/modules/admin/components/AdminActionButton';
import { AdminStatusBadge } from '@/src/modules/admin/components/AdminStatusBadge';

export default function ChampionshipDetailPage() {
  const { championshipId } = useParams();
  const router = useRouter();

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors cursor-pointer" onClick={() => router.back()}>
        <ArrowLeft className="h-4 w-4" />
        <span className="text-sm font-bold">Voltar</span>
      </div>

      <AdminPageHeader
        title="Série Ouro 2024"
        subtitle={`ID: ${championshipId}`}
        action={
          <AdminActionButton icon={Edit2} onClick={() => router.push(`/admin/campeonatos/${championshipId}/edit`)}>
            Editar Campeonato
          </AdminActionButton>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center gap-3 text-slate-400">
            <Calendar className="h-5 w-5" />
            <span className="text-sm font-bold uppercase tracking-wider">Temporada</span>
          </div>
          <p className="text-2xl font-black text-white">2024</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center gap-3 text-slate-400">
            <MapPin className="h-5 w-5" />
            <span className="text-sm font-bold uppercase tracking-wider">Cidade</span>
          </div>
          <p className="text-2xl font-black text-white">Araçoiaba da Serra</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center gap-3 text-slate-400">
            <Trophy className="h-5 w-5" />
            <span className="text-sm font-bold uppercase tracking-wider">Status</span>
          </div>
          <div>
            <AdminStatusBadge status="ACTIVE" />
          </div>
        </div>
      </div>

      <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8">
        <h3 className="text-xl font-black text-white mb-4">Sobre o Campeonato</h3>
        <p className="text-slate-400 leading-relaxed">
          O principal campeonato de futebol amador da região. Conta com a participação de 16 times divididos em dois grupos.
          As partidas ocorrem todos os finais de semana no Estádio Municipal.
        </p>
      </div>
    </div>
  );
}
