import { Activity } from "lucide-react";

interface SystemStatusBadgeProps {
  status: "online" | "maintenance";
}

export function SystemStatusBadge({ status }: SystemStatusBadgeProps) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900/80 border border-zinc-800">
      <div className={`w-2 h-2 rounded-full ${status === 'online' ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-amber-500 shadow-[0_0_8px_#f59e0b]'}`} />
      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
        Sistema: {status === 'online' ? 'Online' : 'Manutenção'}
      </span>
    </div>
  );
}
