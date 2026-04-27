'use client';

import {
  Trophy,
  Users,
  UserSquare2,
  Activity,
  ShieldAlert,
  Calendar,
  Loader2
} from 'lucide-react';
import { AdminPageHeader } from '@/src/modules/admin/components/AdminPageHeader';
import { AdminStatCard } from '@/src/modules/admin/components/AdminStatCard';
import { AdminRecentActivity } from '@/src/modules/admin/components/AdminRecentActivity';
import { AdminQuickActions } from '@/src/modules/admin/components/AdminQuickActions';
import { useEffect, useState } from 'react';

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/dashboard')
      .then(res => res.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="h-8 w-8 animate-spin text-red-600" />
    </div>
  );

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Painel de Controle"
        subtitle="Bem-vindo de volta! Aqui está um resumo do que está acontecendo na Arena."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AdminStatCard
          label="Campeonatos"
          value={data?.stats?.championships || 0}
          icon={Trophy}
          color="amber"
        />
        <AdminStatCard
          label="Times"
          value={data?.stats?.teams || 0}
          icon={Users}
          color="blue"
        />
        <AdminStatCard
          label="Atletas"
          value={data?.stats?.athletes || 0}
          icon={UserSquare2}
          color="indigo"
        />
        <AdminStatCard
          label="Ao Vivo"
          value={data?.stats?.liveMatches || 0}
          icon={Activity}
          color="red"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <Calendar className="h-5 w-5 text-red-600" />
                Atividade Recente
              </h2>
            </div>
            <AdminRecentActivity events={data?.recentActivity || []} />
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6">
            <h2 className="text-xl font-black text-white flex items-center gap-2 mb-6">
              <ShieldAlert className="h-5 w-5 text-red-600" />
              Pendências
            </h2>
            <div className="space-y-4">
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
                <p className="text-sm font-bold text-white">{data?.stats?.pendingUsers || 0} Usuários aguardando aprovação</p>
                <p className="text-xs text-slate-500 mt-1">Verifique as solicitações pendentes</p>
              </div>
            </div>
          </div>

          <AdminQuickActions />
        </div>
      </div>
    </div>
  );
}
