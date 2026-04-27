'use client';

import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Edit2, Users, Shield, MapPin, Trophy } from 'lucide-react';
import { AdminPageHeader } from '@/src/modules/admin/components/AdminPageHeader';
import { AdminActionButton } from '@/src/modules/admin/components/AdminActionButton';
import { AdminStatusBadge } from '@/src/modules/admin/components/AdminStatusBadge';

export default function TeamDetailPage() {
  const { teamId } = useParams();
  const router = useRouter();

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors cursor-pointer" onClick={() => router.back()}>
        <ArrowLeft className="h-4 w-4" />
        <span className="text-sm font-bold">Voltar</span>
      </div>

      <AdminPageHeader
        title="Esporte Clube Araçoiaba"
        subtitle={`ID: ${teamId}`}
        action={
          <AdminActionButton icon={Edit2} onClick={() => router.push(`/admin/teams/${teamId}/edit`)}>
            Editar Time
          </AdminActionButton>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center gap-3 text-slate-400">
            <Trophy className="h-5 w-5" />
            <span className="text-sm font-bold uppercase tracking-wider">Campeonato</span>
          </div>
          <p className="text-lg font-black text-white">Série Ouro 2024</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center gap-3 text-slate-400">
            <MapPin className="h-5 w-5" />
            <span className="text-sm font-bold uppercase tracking-wider">Cidade</span>
          </div>
          <p className="text-lg font-black text-white">Araçoiaba</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center gap-3 text-slate-400">
            <Users className="h-5 w-5" />
            <span className="text-sm font-bold uppercase tracking-wider">Atletas</span>
          </div>
          <p className="text-lg font-black text-white">22</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center gap-3 text-slate-400">
            <Shield className="h-5 w-5" />
            <span className="text-sm font-bold uppercase tracking-wider">Status</span>
          </div>
          <div>
            <AdminStatusBadge status="ACTIVE" />
          </div>
        </div>
      </div>

      <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8">
        <h3 className="text-xl font-black text-white mb-6">Elenco</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex items-center gap-4 p-4 bg-slate-900 border border-slate-800 rounded-2xl">
              <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center font-bold text-red-500">
                {i + 1}
              </div>
              <div>
                <p className="font-bold text-white">Atleta Exemplo {i}</p>
                <p className="text-xs text-slate-500 font-medium">Atacante</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
