import { Button } from "@/components/ui/button";
import { Trophy, Swords, UserPlus } from "lucide-react";
import Link from "next/link";

export function QuickActions() {
  const actions = [
    {
      label: "Criar campeonato",
      icon: Trophy,
      color: "hover:bg-blue-500/10 hover:text-blue-500 text-blue-500/80",
      href: "/admin/campeonatos"
    },
    {
      label: "Criar jogo",
      icon: Swords,
      color: "hover:bg-rose-500/10 hover:text-rose-500 text-rose-500/80",
      href: "/admin/partidas"
    },
    {
      label: "Cadastrar time",
      icon: UserPlus,
      color: "hover:bg-emerald-500/10 hover:text-emerald-500 text-emerald-500/80",
      href: "/admin/times"
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-1 gap-3">
      {actions.map((action) => (
        <Button
          key={action.label}
          variant="outline"
          asChild
          className={`h-auto py-4 px-2 flex flex-col xl:flex-row xl:justify-start gap-3 bg-zinc-900/40 border-zinc-800 transition-all group ${action.color}`}
        >
          <Link href={action.href}>
            <div className="p-2 rounded-lg bg-zinc-950 border border-zinc-800 group-hover:border-zinc-700 transition-colors">
              <action.icon className="w-4 h-4 transition-transform group-hover:scale-110" />
            </div>
            <span className="font-bold tracking-wider uppercase text-[9px] text-center xl:text-left">{action.label}</span>
          </Link>
        </Button>
      ))}
    </div>
  );
}
