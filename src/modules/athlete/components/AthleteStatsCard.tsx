import { AthleteStats } from "@/src/types/athlete";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Goal, Handshake, ScrollText, Trophy } from "lucide-react";

export function AthleteStatsCard({ stats }: { stats: AthleteStats }) {
  const statItems = [
    { label: "Jogos", value: stats.matches, icon: Trophy, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Gols", value: stats.goals, icon: Goal, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Assist.", value: stats.assists, icon: Handshake, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Cartões", value: stats.yellowCards + stats.redCards, icon: ScrollText, color: "text-amber-600", bg: "bg-amber-50" },
  ];

  return (
    <Card className="shadow-sm border-slate-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          Desempenho na Temporada
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {statItems.map((item, index) => (
            <div key={index} className="flex flex-col items-center p-3 rounded-xl border border-slate-100 bg-slate-50/50">
              <div className={`p-2 rounded-lg ${item.bg} ${item.color} mb-2`}>
                <item.icon className="h-5 w-5" />
              </div>
              <span className="text-2xl font-black text-slate-900">{item.value}</span>
              <span className="text-xs font-medium text-slate-500 uppercase tracking-tighter">{item.label}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
