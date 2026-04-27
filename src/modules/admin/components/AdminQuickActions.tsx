import { Button } from "@/components/ui/button";
import {
  UserPlus,
  ShieldCheck,
  History,
  Trophy,
  Users,
  UserCircle,
  Swords,
  Activity
} from "lucide-react";
import Link from "next/link";

export function AdminQuickActions() {
  const primaryActions = [
    { label: "Campeonatos", icon: Trophy, href: "/admin/campeonatos", color: "bg-blue-600 hover:bg-blue-700" },
    { label: "Times", icon: Users, href: "/admin/times", color: "bg-blue-600 hover:bg-blue-700" },
    { label: "Atletas", icon: UserCircle, href: "/admin/atletas", color: "bg-blue-600 hover:bg-blue-700" },
    { label: "Partidas", icon: Swords, href: "/admin/partidas", color: "bg-blue-600 hover:bg-blue-700" },
  ];

  const operationalActions = [
    { label: "AO VIVO / PLACAR", icon: Activity, href: "/admin/live-control", color: "bg-red-600 hover:bg-red-700" },
    { label: "Aprovar Usuários", icon: UserPlus, href: "/admin/usuarios/pending", color: "bg-amber-600 hover:bg-amber-700" },
    { label: "Auditoria", icon: History, href: "/admin/governance", color: "bg-slate-700 hover:bg-slate-800" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {primaryActions.map((action, i) => (
          <Button key={i} asChild className={`${action.color} text-white h-auto py-6 rounded-2xl shadow-md transition-all active:scale-95 flex-1`}>
            <Link href={action.href} className="flex flex-col gap-2 text-center">
              <action.icon className="h-6 w-6 mb-1" />
              <span className="text-xs font-black uppercase tracking-tighter">{action.label}</span>
            </Link>
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 italic">
        {operationalActions.map((action, i) => (
          <Button key={i} variant="outline" asChild className={`h-auto py-4 rounded-xl border-2 transition-all active:scale-95`}>
            <Link href={action.href} className="flex items-center gap-3">
              <action.icon className={`h-5 w-5 ${action.color.split(' ')[0].replace('bg-', 'text-')}`} />
              <span className="text-sm font-bold text-slate-700">{action.label}</span>
            </Link>
          </Button>
        ))}
      </div>
    </div>
  );
}
