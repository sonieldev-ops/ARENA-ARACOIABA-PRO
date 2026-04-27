import { MatchInfo } from "@/src/types/athlete";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, MapPin, Timer } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function AthleteNextMatchCard({ match }: { match: MatchInfo | null }) {
  if (!match) {
    return (
      <Card className="shadow-sm border-slate-200 bg-slate-50/50 border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-10 text-center">
          <Calendar className="h-10 w-10 text-slate-300 mb-3" />
          <h3 className="font-semibold text-slate-900">Nenhum jogo agendado</h3>
          <p className="text-sm text-slate-500 max-w-[200px]">Aguarde a organização definir a próxima rodada.</p>
        </CardContent>
      </Card>
    );
  }

  const matchDate = match.date?.toDate ? match.date.toDate() : new Date(match.date);

  return (
    <Card className="shadow-sm border-slate-200 overflow-hidden">
      <div className="bg-blue-600 px-4 py-2 flex justify-between items-center">
        <span className="text-xs font-bold text-white uppercase tracking-wider">Próximo Desafio</span>
        <Badge variant="outline" className="text-white border-white/30 bg-white/10">
          {match.competition}
        </Badge>
      </div>
      <CardContent className="pt-6">
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center justify-between w-full">
            <div className="flex flex-col items-center flex-1">
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-2">
                <span className="font-bold text-slate-400">V</span>
              </div>
              <span className="text-xs font-medium text-slate-500">VOCÊS</span>
            </div>

            <div className="px-4 text-2xl font-black text-slate-300 italic">VS</div>

            <div className="flex flex-col items-center flex-1">
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-2">
                <span className="font-bold text-slate-400">O</span>
              </div>
              <span className="text-xs font-medium text-slate-500 uppercase truncate max-w-[80px]">
                {match.opponent}
              </span>
            </div>
          </div>

          <div className="w-full space-y-3 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <Calendar className="h-4 w-4 text-blue-600" />
              <span>{matchDate.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <Timer className="h-4 w-4 text-blue-600" />
              <span>{matchDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <MapPin className="h-4 w-4 text-blue-600" />
              <span className="truncate">{match.location}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
