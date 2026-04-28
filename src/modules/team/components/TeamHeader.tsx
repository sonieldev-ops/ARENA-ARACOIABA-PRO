import { Team } from "../types/team.types";
import { Badge } from "@/components/ui/badge";
import { Shield, Trophy, Users } from "lucide-react";
import Image from "next/image";

export function TeamHeader({ team, memberCount }: { team: Team; memberCount: number }) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-2xl border shadow-sm mb-8">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center border-2 border-slate-50 relative overflow-hidden">
          {team.logoUrl ? (
            <Image
              src={team.logoUrl}
              alt={team.name}
              fill
              className="object-cover rounded-xl"
              unoptimized
            />
          ) : (
            <Shield className="h-8 w-8 text-slate-300" />
          )}
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">{team.name}</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold">
              {team.category}
            </Badge>
            <span className="text-slate-300">|</span>
            <div className="flex items-center gap-1 text-sm text-slate-500 font-medium">
              <Users className="h-4 w-4" />
              {memberCount} Jogadores
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="text-center px-4 py-2 bg-slate-50 rounded-xl border border-slate-100">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Títulos</p>
          <div className="flex items-center justify-center gap-1 text-slate-900 font-black">
            <Trophy className="h-4 w-4 text-amber-500" /> 0
          </div>
        </div>
      </div>
    </div>
  );
}
