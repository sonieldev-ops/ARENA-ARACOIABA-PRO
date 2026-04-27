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

export default function GovernancePage() {
  const { data, loading, refresh } = useGovernanceDashboard();

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 pb-20">
      {/* Header Executivo */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Governança e Auditoria</h1>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Painel Executivo</Badge>
          </div>
          <p className="text-slate-500 mt-1">
            Monitoramento de conformidade, controle de acesso e trilha de auditoria administrativa.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={refresh} disabled={loading} className="gap-2">
            <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="w-4 h-4" />
            Exportar Relatório
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 gap-2">
            <ShieldCheck className="w-4 h-4" />
            Revisão de Acessos
          </Button>
        </div>
      </div>

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
      <div className="pt-8 border-t flex items-center justify-between text-[10px] text-slate-400 uppercase tracking-widest">
         <span>Arena Aracoiaba Pro - Sistema de Governança</span>
         <div className="flex items-center gap-4">
            <span>Última atualização: {new Date().toLocaleTimeString()}</span>
            <span>Versão da Auditoria: v2.4.0</span>
         </div>
      </div>
    </div>
  );
}
