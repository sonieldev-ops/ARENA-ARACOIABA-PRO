import { Button } from "@/components/ui/button";
import { UserPlus, ShieldCheck, History, Settings, FileText, Database } from "lucide-react";
import Link from "next/link";

export function AdminQuickActions() {
  const actions = [
    { label: "Aprovar Usuários", icon: UserPlus, href: "/admin/users/pending", color: "bg-amber-600 hover:bg-amber-700" },
    { label: "Ver Auditoria", icon: History, href: "/admin/audit", color: "bg-blue-600 hover:bg-blue-700" },
    { label: "Governança", icon: ShieldCheck, href: "/admin/governance", color: "bg-emerald-600 hover:bg-emerald-700" },
    { label: "Logs de Sistema", icon: Database, href: "/admin/logs", color: "bg-slate-700 hover:bg-slate-800" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {actions.map((action, i) => (
        <Button key={i} asChild className={`${action.color} text-white h-auto py-4 rounded-xl shadow-sm transition-all active:scale-95`}>
          <Link href={action.href} className="flex flex-col gap-2">
            <action.icon className="h-5 w-5" />
            <span className="text-xs font-bold">{action.label}</span>
          </Link>
        </Button>
      ))}
    </div>
  );
}
