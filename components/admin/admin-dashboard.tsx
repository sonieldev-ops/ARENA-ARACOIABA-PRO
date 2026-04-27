import { StatsCard } from "./stats-card";
import { MatchCardAdmin } from "./match-card-admin";
import { QuickActions } from "./quick-actions";
import { SystemStatusBadge } from "./system-status-badge";
import { Trophy, Swords, Users, DollarSign } from "lucide-react";

export function AdminDashboard() {
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
          <p className="text-zinc-500 text-sm mt-1 font-medium">
            Gestão operacional da Arena Araçoiaba Pro
          </p>
        </div>
        <SystemStatusBadge status="online" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <StatsCard key={stat.title} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Swords className="w-5 h-5 text-blue-500" />
              Jogos do Dia
            </h2>
            <button className="text-[10px] text-blue-500 hover:text-blue-400 font-black uppercase tracking-widest transition-colors border border-blue-500/20 px-3 py-1 rounded-full hover:bg-blue-500/5">
              Ver todos os jogos
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

          <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-blue-600/10 transition-colors" />
            <h3 className="text-white font-bold mb-2">Suporte Premium</h3>
            <p className="text-zinc-500 text-sm mb-6 leading-relaxed">
              Precisa de ajuda estratégica para sua liga? Nosso time de especialistas está a um clique de distância.
            </p>
            <a
              href="https://wa.me/5581993518254?text=Olá, preciso de suporte estratégico para a Arena Araçoiaba Pro."
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-all text-xs uppercase tracking-[0.2em] shadow-lg shadow-blue-900/30 active:scale-95 flex items-center justify-center gap-2"
            >
              Falar com Gerente
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
