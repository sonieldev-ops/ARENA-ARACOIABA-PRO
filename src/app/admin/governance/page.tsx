'use client';

import { ShieldAlert, UserX, UserMinus, Key, AlertTriangle } from 'lucide-react';
import { AdminPageHeader } from '@/src/modules/admin/components/AdminPageHeader';
import { AdminStatCard } from '@/src/modules/admin/components/AdminStatCard';
import { AdminDataTable } from '@/src/modules/admin/components/AdminDataTable';
import { AdminStatusBadge } from '@/src/modules/admin/components/AdminStatusBadge';

interface GovernanceIssue {
  id: string;
  type: string;
  target: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: string;
  date: string;
}

const mockIssues: GovernanceIssue[] = [
  { id: '1', type: 'Role Escalation', target: 'usuario_teste_1', severity: 'HIGH', status: 'PENDING', date: '10 min atrás' },
  { id: '2', type: 'Multiple Failed Logins', target: 'admin_prev', severity: 'MEDIUM', status: 'REVIEWED', date: '1 hora atrás' },
  { id: '3', type: 'Data Export Attempt', target: 'staff_01', severity: 'CRITICAL', status: 'BLOCKED', date: 'Ontem' },
];

export default function GovernancePage() {
  const columns = [
    { header: 'Tipo de Alerta', accessorKey: 'type' as keyof GovernanceIssue, className: 'font-bold text-white' },
    { header: 'Alvo', accessorKey: 'target' as keyof GovernanceIssue },
    {
      header: 'Gravidade',
      cell: (item: GovernanceIssue) => (
        <span className={
          item.severity === 'CRITICAL' ? 'text-red-500 font-black' :
          item.severity === 'HIGH' ? 'text-amber-500 font-bold' : 'text-slate-400'
        }>
          {item.severity}
        </span>
      )
    },
    {
      header: 'Status',
      cell: (item: GovernanceIssue) => <AdminStatusBadge status={item.status} />
    },
    { header: 'Data', accessorKey: 'date' as keyof GovernanceIssue },
  ];

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Governança"
        subtitle="Monitoramento de segurança e integridade do sistema."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AdminStatCard label="Bloqueados" value="5" icon={UserX} color="red" />
        <AdminStatCard label="Suspensos" value="12" icon={UserMinus} color="amber" />
        <AdminStatCard label="Trocas de Role" value="28" icon={Key} color="indigo" />
        <AdminStatCard label="Alertas Críticos" value="3" icon={ShieldAlert} color="red" />
      </div>

      <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6">
        <h2 className="text-xl font-black text-white flex items-center gap-2 mb-6">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          Incidentes Recentes
        </h2>
        <AdminDataTable columns={columns} data={mockIssues} />
      </div>
    </div>
  );
}
