import { AuditSummary } from '../types/audit-report.types';
import {
  ShieldAlert,
  Users,
  Activity,
  Layers
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AuditSummaryCardsProps {
  summary: AuditSummary | null;
  loading: boolean;
}

export function AuditSummaryCards({ summary, loading }: AuditSummaryCardsProps) {
  const cards = [
    {
      title: 'Total de Eventos',
      value: summary?.totalEvents ?? 0,
      icon: Activity,
      color: 'text-blue-600',
    },
    {
      title: 'Eventos Críticos',
      value: summary?.criticalEvents ?? 0,
      icon: ShieldAlert,
      color: 'text-red-600',
    },
    {
      title: 'Operadores Ativos',
      value: summary?.uniqueOperators ?? 0,
      icon: Users,
      color: 'text-purple-600',
    },
    {
      title: 'Correlações (Unique)',
      value: summary ? Object.keys(summary.actionBreakdown).length : 0, // Simplificação
      icon: Layers,
      color: 'text-orange-600',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {card.title}
            </CardTitle>
            <card.icon className={`h-4 w-4 ${card.color}`} />
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-8 w-16 animate-pulse rounded bg-muted" />
            ) : (
              <div className="text-2xl font-bold">{card.value}</div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
