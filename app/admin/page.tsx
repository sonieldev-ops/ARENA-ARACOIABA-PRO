'use client';

import { useAdminDashboard } from "@/src/modules/admin/hooks/use-admin-dashboard";
import { AdminKpiCards } from "@/src/modules/admin/components/AdminKpiCards";
import { AdminQuickActions } from "@/src/modules/admin/components/AdminQuickActions";
import { AdminRecentActivity } from "@/src/modules/admin/components/AdminRecentActivity";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ShieldCheck,
  Users,
  ArrowRight,
  Loader2,
  AlertCircle,
  RefreshCcw
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default function AdminDashboardPage() {
  const { data, loading, error, refresh } = useAdminDashboard();

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600 mx-auto" />
          <p className="text-slate-500 font-medium">Sincronizando dados administrativos...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-md mx-auto mt-20 p-8 text-center bg-white border rounded-2xl shadow-sm">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-slate-900 font-bold text-xl mb-2">Falha no Dashboard</h2>
        <p className="text-slate-500 mb-6">{error || 'Não foi possível conectar ao serviço de métricas.'}</p>
        <Button onClick={refresh} className="w-full">
          <RefreshCcw className="mr-2 h-4 w-4" />
          Tentar Novamente
        </Button>
      </div>
    );
  }

  const { metrics, recentPendingUsers, recentAuditEvents } = data;

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto">
      {/* 1. Header Administrativo */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <ShieldCheck className="h-8 w-8 text-blue-600" />
            Painel de Controle
          </h1>
          <p className="text-slate-500 font-medium mt-1">Bem-vindo à central de governança da Arena Aracoiaba Pro.</p>
        </div>
        <div className="flex items-center gap-2">
           <Button variant="outline" size="sm" onClick={refresh}>
             <RefreshCcw className="h-4 w-4 mr-2" /> Atualizar
           </Button>
           <Badge className="bg-blue-600">SISTEMA ONLINE</Badge>
        </div>
      </div>

      {/* 2. Bloco de KPIs (Métricas em tempo real) */}
      <AdminKpiCards metrics={metrics} />

      {/* 3. Ações Rápidas de Operação */}
      <section className="space-y-4">
        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Operações Críticas</h2>
        <AdminQuickActions />
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* 4. Coluna de Usuários Pendentes (Aprovação Rápida) */}
        <div className="xl:col-span-1">
          <Card className="shadow-sm border-slate-200 h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Users className="h-5 w-5 text-amber-500" />
                Aprovações Pendentes
              </CardTitle>
              <Button variant="ghost" size="sm" asChild className="text-blue-600 hover:text-blue-700 font-bold">
                <Link href="/admin/users/pending">Ver Todos</Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentPendingUsers.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-sm text-slate-500 italic">Tudo em dia! Nenhuma solicitação.</p>
                  </div>
                ) : (
                  recentPendingUsers.map((user) => (
                    <div key={user.uid} className="flex items-center justify-between p-3 rounded-xl border border-slate-50 bg-slate-50/50">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-900">{user.fullName}</span>
                        <span className="text-[10px] text-slate-500">{user.requestedRole}</span>
                      </div>
                      <Button size="sm" variant="outline" className="h-8 text-[10px] font-bold" asChild>
                        <Link href={`/admin/users/pending?uid=${user.uid}`}>
                          REVISAR <ArrowRight className="ml-1 h-3 w-3" />
                        </Link>
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 5. Coluna de Auditoria e Atividade Recente */}
        <div className="xl:col-span-2">
          <AdminRecentActivity events={recentAuditEvents} />
        </div>
      </div>
    </div>
  );
}
