import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin } from "lucide-react";

interface MatchCardAdminProps {
  homeTeam: string;
  awayTeam: string;
  time: string;
  location: string;
  status: "live" | "scheduled" | "finished";
}

export function MatchCardAdmin({ homeTeam, awayTeam, time, location, status }: MatchCardAdminProps) {
  const statusConfig = {
    live: { label: "AO VIVO", className: "bg-emerald-500/20 text-emerald-500 animate-pulse border-emerald-500/50" },
    scheduled: { label: "AGENDADO", className: "bg-blue-500/20 text-blue-500 border-blue-500/50" },
    finished: { label: "FINALIZADO", className: "bg-zinc-500/20 text-zinc-400 border-zinc-500/50" },
  };

  return (
    <Card className="bg-zinc-900/40 border-zinc-800 hover:border-zinc-700 transition-all">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <Badge variant="outline" className={statusConfig[status].className}>
            {statusConfig[status].label}
          </Badge>
          <div className="flex items-center gap-2 text-zinc-500 text-sm">
            <Clock className="w-3 h-3" />
            {time}
          </div>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 text-center">
            <div className="w-12 h-12 bg-zinc-800 rounded-full mx-auto mb-2 flex items-center justify-center text-zinc-600 font-bold">
              {homeTeam.substring(0, 2).toUpperCase()}
            </div>
            <p className="font-semibold text-white text-sm truncate">{homeTeam}</p>
          </div>

          <div className="text-zinc-700 font-black italic text-xl">VS</div>

          <div className="flex-1 text-center">
            <div className="w-12 h-12 bg-zinc-800 rounded-full mx-auto mb-2 flex items-center justify-center text-zinc-600 font-bold">
              {awayTeam.substring(0, 2).toUpperCase()}
            </div>
            <p className="font-semibold text-white text-sm truncate">{awayTeam}</p>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-zinc-800/50 flex items-center gap-2 text-zinc-500 text-xs">
          <MapPin className="w-3 h-3" />
          {location}
        </div>
      </CardContent>
    </Card>
  );
}
