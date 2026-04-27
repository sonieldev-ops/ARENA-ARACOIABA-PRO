import { cn, translateStatus } from "@/src/lib/utils";

type StatusType = 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'FINISHED' | 'LIVE' | 'SCHEDULED' | 'BLOCKED' | 'APPROVED' | 'REJECTED';

interface AdminStatusBadgeProps {
  status: StatusType | string;
}

export function AdminStatusBadge({ status }: AdminStatusBadgeProps) {
  const statusStyles: Record<string, string> = {
    ACTIVE: "bg-green-500/10 text-green-500 border-green-500/20",
    APPROVED: "bg-green-500/10 text-green-500 border-green-500/20",
    INACTIVE: "bg-slate-500/10 text-slate-500 border-slate-500/20",
    PENDING: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    FINISHED: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    LIVE: "bg-red-500/10 text-red-500 border-red-500/20 animate-pulse",
    SCHEDULED: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
    BLOCKED: "bg-red-900/10 text-red-400 border-red-900/20",
    REJECTED: "bg-red-900/10 text-red-400 border-red-900/20",
  };

  const displayStatus = typeof status === 'string' ? status : 'INVALID';
  const style = statusStyles[displayStatus] || statusStyles.PENDING;

  return (
    <span className={cn(
      "px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border",
      style
    )}>
      {translateStatus(displayStatus)}
    </span>
  );
}
