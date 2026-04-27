'use client';

import {
  Trophy,
  Users,
  UserSquare2,
  Activity,
  ShieldAlert,
  Calendar
} from 'lucide-react';
import { AdminPageHeader } from '@/src/modules/admin/components/AdminPageHeader';
import { AdminStatCard } from '@/src/modules/admin/components/AdminStatCard';
import { AdminRecentActivity } from '@/src/modules/admin/components/AdminRecentActivity';
import { AdminQuickActions } from '@/src/modules/admin/components/AdminQuickActions';

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Painel de Controle"
        subtitle="Bem-vindo de volta! Aqui está um resumo do que está acontecendo na Arena."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AdminStatCard
          label="Campeonatos"
          value="12"
          icon={Trophy}
          trend={{ value: '8%', isUp: true }}
          color="amber"
        />
        <AdminStatCard
          label="Times"
          value="48"
          icon={Users}
          trend={{ value: '12%', isUp: true }}
          color="blue"
        />
        <AdminStatCard
          label="Atletas"
          value="850"
          icon={UserSquare2}
          trend={{ value: '5%', isUp: true }}
          color="indigo"
        />
        <AdminStatCard
          label="Ao Vivo"
          value="3"
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
            <AdminRecentActivity />
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
                <p className="text-sm font-bold text-white">4 Usuários aguardando aprovação</p>
                <p className="text-xs text-slate-500 mt-1">Verifique as solicitações pendentes</p>
              </div>
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
                <p className="text-sm font-bold text-white">2 Resultados para validar</p>
                <p className="text-xs text-slate-500 mt-1">Série Ouro - Rodada 5</p>
              </div>
            </div>
          </div>

          <AdminQuickActions />
        </div>
      </div>
    </div>
  );
}
