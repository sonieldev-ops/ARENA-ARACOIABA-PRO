import { UserProfile } from "@/src/types/auth";
import { TeamInfo } from "@/src/types/athlete";
import { Badge } from "@/components/ui/badge";
import { Shield } from "lucide-react";

export function AthleteHeader({ profile, team }: { profile: UserProfile; team: TeamInfo | null }) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Olá, {profile.fullName.split(' ')[0]}! 👋</h1>
        <p className="text-slate-500">Bem-vindo ao seu portal do atleta na Arena Aracoiaba.</p>
      </div>

      {team && (
        <div className="flex items-center gap-3 bg-white p-3 rounded-xl border shadow-sm">
          <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
            <Shield className="text-blue-600 h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium leading-none uppercase tracking-wider">Seu Time</p>
            <p className="text-sm font-bold text-slate-900">{team.name}</p>
          </div>
          <Badge variant="secondary" className="ml-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100">ATIVO</Badge>
        </div>
      )}
    </div>
  );
}
