import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface AdminStatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: string;
    isUp: boolean;
  };
  color?: string;
}

export function AdminStatCard({ label, value, icon: Icon, trend, color = "red" }: AdminStatCardProps) {
  const colorMap: Record<string, string> = {
    red: "text-red-600 bg-red-600/10",
    blue: "text-blue-600 bg-blue-600/10",
    green: "text-green-600 bg-green-600/10",
    amber: "text-amber-600 bg-amber-600/10",
    indigo: "text-indigo-600 bg-indigo-600/10",
  };

  return (
    <Card className="bg-slate-900 border-slate-800 hover:border-slate-700 transition-all overflow-hidden group">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">{label}</p>
            <h3 className="text-3xl font-black text-white tracking-tighter">{value}</h3>
            {trend && (
              <p className={`text-xs font-bold mt-2 ${trend.isUp ? 'text-green-500' : 'text-red-500'}`}>
                {trend.isUp ? '↑' : '↓'} {trend.value} <span className="text-slate-500 ml-1">vs mês passado</span>
              </p>
            )}
          </div>
          <div className={`p-4 rounded-2xl ${colorMap[color]} group-hover:scale-110 transition-transform duration-300`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
