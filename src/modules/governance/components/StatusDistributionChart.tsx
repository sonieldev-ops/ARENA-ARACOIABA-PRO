import React from 'react';
import { StatusDistributionItem } from '../types/governance.types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface StatusDistributionChartProps {
  data: StatusDistributionItem[];
  loading?: boolean;
}

export function StatusDistributionChart({ data, loading }: StatusDistributionChartProps) {
  if (loading) {
    return <div className="h-64 bg-slate-50 animate-pulse rounded-xl border"></div>;
  }

  return (
    <Card className="shadow-sm border-slate-200 h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-slate-900">Distribuição de Usuários</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data.map(item => ({
                  ...item,
                  statusLabel: 
                    item.status === 'ACTIVE' ? 'Ativo' :
                    item.status === 'PENDING_APPROVAL' ? 'Pendente' :
                    item.status === 'BLOCKED' ? 'Bloqueado' :
                    item.status === 'SUSPENDED' ? 'Suspenso' : item.status
                }))}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="count"
                nameKey="statusLabel"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '12px' }}
                formatter={(value: any, name: any) => [value, name]}
              />
              <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
