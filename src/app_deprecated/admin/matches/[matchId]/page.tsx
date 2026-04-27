'use client';

import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Edit2, Trophy, MapPin, Calendar, Clock, Activity } from 'lucide-react';
import { AdminPageHeader } from '@/src/modules/admin/components/AdminPageHeader';
import { AdminActionButton } from '@/src/modules/admin/components/AdminActionButton';
import { AdminStatusBadge } from '@/src/modules/admin/components/AdminStatusBadge';

export default function MatchDetailPage() {
  const { matchId } = useParams();
  const router = useRouter();

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors cursor-pointer" onClick={() => router.back()}>
        <ArrowLeft className="h-4 w-4" />
        <span className="text-sm font-bold">Voltar</span>
      </div>

      <AdminPageHeader
        title="EC Araçoiaba vs Vila Real FC"
        subtitle={`ID: ${matchId}`}
        action={
          <div className="flex gap-3">
            <AdminActionButton
              variant="outline"
              icon={Activity}
              onClick={() => router.push(`/admin/live-control?matchId=${matchId}`)}
            >
              Controle Ao Vivo
            </AdminActionButton>
            <AdminActionButton icon={Edit2} onClick={() => router.push(`/admin/partidas/${matchId}/edit`)}>
              Editar Partida
            </AdminActionButton>
          </div>
        }
      />

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute top-6 right-6">
          <AdminStatusBadge status="FINISHED" />
        </div>

        <div className="flex items-center gap-16 mb-8">
          <div className="text-center">
            <div className="w-24 h-24 bg-slate-800 rounded-3xl mb-4 mx-auto flex items-center justify-center font-black text-3xl">A</div>
            <h3 className="text-xl font-black text-white">EC Araçoiaba</h3>
          </div>

          <div className="flex flex-col items-center">
             <div className="flex items-center gap-8">
                <span className="text-8xl font-black text-white tabular-nums">2</span>
                <span className="text-3xl font-bold text-slate-700">X</span>
                <span className="text-8xl font-black text-white tabular-nums">1</span>
             </div>
             <p className="text-sm font-bold text-slate-500 mt-4 uppercase tracking-widest">Placar Final</p>
          </div>

          <div className="text-center">
            <div className="w-24 h-24 bg-slate-800 rounded-3xl mb-4 mx-auto flex items-center justify-center font-black text-3xl">B</div>
            <h3 className="text-xl font-black text-white">Vila Real FC</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center gap-3 text-slate-400">
            <Trophy className="h-5 w-5" />
            <span className="text-sm font-bold uppercase tracking-wider">Campeonato</span>
          </div>
          <p className="text-lg font-black text-white">Série Ouro 2024</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center gap-3 text-slate-400">
            <Calendar className="h-5 w-5" />
            <span className="text-sm font-bold uppercase tracking-wider">Data</span>
          </div>
          <p className="text-lg font-black text-white">10 de Maio, 2024</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center gap-3 text-slate-400">
            <MapPin className="h-5 w-5" />
            <span className="text-sm font-bold uppercase tracking-wider">Local</span>
          </div>
          <p className="text-lg font-black text-white">Estádio Municipal</p>
        </div>
      </div>

      <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8">
        <h3 className="text-xl font-black text-white mb-6">Eventos da Partida</h3>
        <div className="space-y-4">
          <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-red-500 font-bold">12'</span>
              <p className="text-white font-medium">Gol - Ricardo Oliveira (EC Araçoiaba)</p>
            </div>
          </div>
          <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-red-500 font-bold">44'</span>
              <p className="text-white font-medium">Gol - Marcos Silva (Vila Real FC)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
