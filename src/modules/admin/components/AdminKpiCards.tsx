import { AdminDashboardMetrics } from "../types/admin-dashboard.types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, UserClock, ShieldAlert, Activity } from "lucide-react";

export function AdminKpiCards({ metrics }: { metrics: AdminDashboardMetrics }) {
  const cards = [
    {
      title: "Total de Usuários",
      value: metrics.totalUsers,
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
      description: "Base total cadastrada"
    },
    {
      title: "Pendentes",
      value: metrics.pendingUsers,
      icon: UserClock,
      color: "text-amber-600",
      bg: "bg-amber-50",
      description: "Aguardando aprovação",
      alert: metrics.pendingUsers > 0
    },
    {
      title: "Usuários Ativos",
      value: metrics.activeUsers,
      icon: UserCheck,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      description: "Acesso liberado"
    },
    {
      title: "Admins",
      value: metrics.totalAdmins,
      icon: ShieldAlert,
      color: "text-purple-600",
      bg: "bg-purple-50",
      description: "Gestores do sistema"
    },
    {
      title: "Auditoria (24h)",
      value: metrics.auditEventsLast24h,
      icon: Activity,
      color: "text-rose-600",
      bg: "bg-rose-50",
      description: "Ações administrativas"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((card, i) => (
        <Card key={i} className={`shadow-sm border-slate-200 ${card.alert ? 'ring-2 ring-amber-500/20' : ''}`}>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {card.title}
            </CardTitle>
            <div className={`p-2 rounded-lg ${card.bg} ${card.color}`}>
              <card.icon className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-slate-900">{card.value}</div>
            <p className="text-[10px] text-slate-500 mt-1 font-medium">{card.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
