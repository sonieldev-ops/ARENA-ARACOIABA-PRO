import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export function StatsCard({ title, value, icon: Icon, description, trend }: StatsCardProps) {
  return (
    <Card className="bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 transition-all hover:shadow-[0_0_20px_rgba(0,0,0,0.3)] group">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium text-zinc-400 group-hover:text-zinc-300 transition-colors">
          {title}
        </CardTitle>
        <Icon className="w-4 h-4 text-zinc-500 group-hover:text-blue-500 transition-colors" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-white tracking-tight">{value}</div>
        {description && (
          <p className="text-xs text-zinc-500 mt-1 flex items-center gap-1">
            {trend && (
              <span className={trend.isPositive ? "text-emerald-500" : "text-rose-500"}>
                {trend.isPositive ? "+" : "-"}{trend.value}%
              </span>
            )}
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
