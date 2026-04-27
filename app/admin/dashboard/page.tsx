import { StatsCard } from "@/components/admin/stats-card";
import { MatchCardAdmin } from "@/components/admin/match-card-admin";
import { QuickActions } from "@/components/admin/quick-actions";
import { SystemStatusBadge } from "@/components/admin/system-status-badge";
import { Trophy, Swords, Users, DollarSign } from "lucide-react";

export default function AdminDashboardPage() {
  const stats = [
    { title: "Campeonatos Ativos", value: "4", icon: Trophy, trend: { value: 12, isPositive: true }, description: "vs. mês anterior" },
    { title: "Jogos Hoje", value: "8", icon: Swords, description: "3 jogos ao vivo agora" },
    { title: "Times Cadastrados", value: "42", icon: Users, trend: { value: 8, isPositive: true }, description: "novos times este mês" },
    { title: "Receita Estimada", value: "R$ 15.400", icon: DollarSign, trend: { value: 24, isPositive: true }, description: "crescimento mensal" },
  ];

  const todayMatches = [
    { homeTeam: "Araçoiaba FC", awayTeam: "Igarassu City", time: "14:30", location: "Arena Principal", status: "live" as const },
    { homeTeam: "Sport Club", awayTeam: "Náutico Amador", time: "16:00", location: "Campo B", status: "scheduled" as const },
    { homeTeam: "Bangu de Araçoiaba", awayTeam: "Vila Nova", time: "10:00", location: "Arena Principal", status: "finished" as const },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white uppercase italic">
            Dashboard <span className="text-blue-500">PRO</span>
          </h1>
          <p className="text-zinc-500 text-sm mt-1">
            Gestão operacional da Arena Araçoiaba Pro
          </p>
        </div>
        <SystemStatusBadge status="online" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <StatsCard key={stat.title} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Swords className="w-5 h-5 text-blue-500" />
              Jogos do Dia
            </h2>
            <button className="text-xs text-blue-500 hover:text-blue-400 font-bold uppercase transition-colors">
              Ver todos
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {todayMatches.map((match, i) => (
              <MatchCardAdmin key={i} {...match} />
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
              Ações Rápidas
            </h2>
            <QuickActions />
          </div>

          <div className="bg-gradient-to-br from-blue-600/10 to-indigo-600/10 border border-blue-500/20 rounded-xl p-6">
            <h3 className="text-white font-bold mb-2">Suporte Premium</h3>
            <p className="text-zinc-400 text-sm mb-4">
              Precisa de ajuda com a gestão da sua liga? Nosso time está disponível.
            </p>
            <button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg transition-colors text-sm">
              Falar com Gerente
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
