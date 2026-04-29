'use client';

import React from 'react';
import { useGovernanceDashboard } from '@/src/modules/governance/hooks/useGovernanceDashboard';
import { GovernanceKpiGrid } from '@/src/modules/governance/components/GovernanceKpiGrid';
import { GovernanceAlertsPanel } from '@/src/modules/governance/components/GovernanceAlertsPanel';
import { RecentAuditTimeline } from '@/src/modules/governance/components/RecentAuditTimeline';
import { StatusDistributionChart } from '@/src/modules/governance/components/StatusDistributionChart';
import { Button } from '@/components/ui/button';
import { RefreshCcw, ShieldCheck, Download, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

import { AdminPageHeader } from '@/src/modules/admin/components/AdminPageHeader';

export default function GovernancePage() {
  const { data, loading, refresh } = useGovernanceDashboard();

  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <AdminPageHeader
        title="Governança e Auditoria"
        subtitle="Monitoramento de conformidade, controle de acesso e trilha de auditoria administrativa."
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={refresh} disabled={loading} className="gap-2 border-slate-800 text-slate-400">
              <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
            <Button variant="outline" size="sm" className="gap-2 border-slate-800 text-slate-400">
              <Download className="w-4 h-4" />
              Exportar
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700 gap-2">
              <ShieldCheck className="w-4 h-4" />
              Revisão de Acessos
            </Button>
          </div>
        }
      />

      {/* Grid de KPIs principais */}
      <GovernanceKpiGrid kpis={data?.kpis || []} loading={loading} />

      {/* Alertas de Governança */}
      <GovernanceAlertsPanel alerts={data?.alerts || []} />

      {/* Conteúdo Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Coluna da Esquerda: Gráficos e Distribuição */}
        <div className="lg:col-span-1 space-y-8">
           <StatusDistributionChart data={data?.statusDistribution || []} loading={loading} />

           <div className="bg-slate-900 text-white p-6 rounded-xl shadow-lg border border-slate-800">
              <h4 className="text-sm font-semibold mb-2 flex items-center gap-2 text-blue-400">
                <ShieldCheck className="w-4 h-4" />
                Saúde da Governança
              </h4>
              <div className="text-3xl font-bold">98.2%</div>
              <p className="text-xs text-slate-400 mt-2">
                Índice de conformidade baseado em logs de auditoria vs. alterações de estado.
              </p>
              <Button variant="ghost" className="w-full mt-4 text-xs text-blue-400 hover:text-blue-300 hover:bg-white/5 border border-white/10">
                Ver Métricas de Risco
              </Button>
           </div>
        </div>

        {/* Coluna da Direita: Timeline de Auditoria */}
        <div className="lg:col-span-2">
           <RecentAuditTimeline logs={data?.recentAudit || []} loading={loading} />
        </div>

      </div>

      {/* Footer de Informação */}
      <footer className="mt-20 pt-10 border-t border-slate-800 w-full block">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-[10px] text-slate-500 uppercase tracking-widest px-2">
          <span className="font-medium">Arena Aracoiaba Pro — Sistema de Governança e Auditoria</span>
          <div className="flex items-center gap-8">
             <span className="flex items-center gap-2">
               <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
               Última atualização: {mounted ? new Date().toLocaleTimeString() : '--:--:--'}
             </span>
             <span className="text-slate-600">Versão da Auditoria: v2.4.0</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
