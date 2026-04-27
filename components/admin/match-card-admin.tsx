import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin } from "lucide-react";

import { cn } from "@/src/lib/utils";

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
    <Card className="bg-zinc-900/40 border-zinc-800 hover:border-zinc-700 transition-all flex flex-col h-full">
      <CardContent className="p-5 flex flex-col h-full">
        <div className="flex items-center justify-between mb-6">
          <Badge variant="outline" className={cn("px-2 py-0.5 text-[10px] font-black tracking-widest", statusConfig[status].className)}>
            {statusConfig[status].label}
          </Badge>
          <div className="flex items-center gap-1.5 text-zinc-500 text-[10px] font-bold">
            <Clock className="w-3 h-3" />
            {time}
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 flex-1">
          <div className="flex-1 flex flex-col items-center gap-2 min-w-0">
            <div className="w-12 h-12 bg-zinc-950 border border-zinc-800 rounded-2xl flex items-center justify-center text-zinc-400 font-black text-sm shadow-inner transition-colors">
              {homeTeam.substring(0, 2).toUpperCase()}
            </div>
            <p className="font-bold text-white text-xs text-center truncate w-full">{homeTeam}</p>
          </div>

          <div className="flex flex-col items-center gap-1 px-2">
            <span className="text-zinc-800 font-black italic text-lg tracking-tighter">VS</span>
          </div>

          <div className="flex-1 flex flex-col items-center gap-2 min-w-0">
            <div className="w-12 h-12 bg-zinc-950 border border-zinc-800 rounded-2xl flex items-center justify-center text-zinc-400 font-black text-sm shadow-inner transition-colors">
              {awayTeam.substring(0, 2).toUpperCase()}
            </div>
            <p className="font-bold text-white text-xs text-center truncate w-full">{awayTeam}</p>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-zinc-800/50 flex items-center gap-2 text-zinc-500 text-[10px] font-bold uppercase tracking-wider">
          <MapPin className="w-3 h-3 text-blue-500" />
          <span className="truncate">{location}</span>
        </div>
      </CardContent>
    </Card>
  );
}
