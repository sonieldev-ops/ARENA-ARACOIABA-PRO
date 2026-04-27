import { Button } from "@/components/ui/button";
import { Trophy, Swords, UserPlus } from "lucide-react";

export function QuickActions() {
  const actions = [
    { label: "Criar campeonato", icon: Trophy, color: "hover:bg-blue-500/10 hover:text-blue-500 text-blue-500/80" },
    { label: "Criar jogo", icon: Swords, color: "hover:bg-rose-500/10 hover:text-rose-500 text-rose-500/80" },
    { label: "Cadastrar time", icon: UserPlus, color: "hover:bg-emerald-500/10 hover:text-emerald-500 text-emerald-500/80" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {actions.map((action) => (
        <Button
          key={action.label}
          variant="outline"
          className={`h-auto py-4 flex flex-col gap-2 bg-zinc-900/40 border-zinc-800 transition-all group ${action.color}`}
        >
          <action.icon className="w-5 h-5 transition-transform group-hover:scale-110" />
          <span className="font-semibold tracking-wide uppercase text-[10px]">{action.label}</span>
        </Button>
      ))}
    </div>
  );
}
