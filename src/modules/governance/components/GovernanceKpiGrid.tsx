import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GovernanceKpi } from '../types/governance.types';
import { cn } from '@/lib/utils';
import { ArrowUpRight, ArrowDownRight, Users, ShieldCheck, ShieldAlert, Clock } from 'lucide-react';

interface GovernanceKpiGridProps {
  kpis: GovernanceKpi[];
  loading?: boolean;
}

export function GovernanceKpiGrid({ kpis, loading }: GovernanceKpiGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-slate-100 animate-pulse rounded-xl border"></div>
        ))}
      </div>
    );
  }

  const getIcon = (label: string) => {
    switch (label) {
      case 'Pendentes': return <Clock className="w-4 h-4" />;
      case 'Ativos': return <Users className="w-4 h-4" />;
      case 'Bloqueados': return <ShieldAlert className="w-4 h-4" />;
      case 'Suspensos': return <ShieldCheck className="w-4 h-4" />;
      default: return null;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi) => (
        <Card key={kpi.label} className="overflow-hidden shadow-sm border-slate-200 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {kpi.label}
            </CardTitle>
            <div className={cn(
               "p-2 rounded-lg",
               kpi.variant === 'warning' && "bg-amber-100 text-amber-600",
               kpi.variant === 'success' && "bg-emerald-100 text-emerald-600",
               kpi.variant === 'destructive' && "bg-red-100 text-red-600",
               kpi.variant === 'info' && "bg-blue-100 text-blue-600",
               kpi.variant === 'default' && "bg-slate-100 text-slate-600",
            )}>
               {getIcon(kpi.label)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{kpi.value}</div>
            <p className="text-[10px] text-slate-400 mt-1 line-clamp-1">
              {kpi.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
