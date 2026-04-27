import { ReactNode } from 'react';
import { LucideIcon, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AdminEmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
}

export function AdminEmptyState({
  icon: Icon = Search,
  title,
  description,
  action
}: AdminEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center bg-slate-900/50 rounded-3xl border-2 border-dashed border-slate-800">
      <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mb-6 border border-slate-700">
        <Icon className="h-8 w-8 text-slate-500" />
      </div>
      <h3 className="text-xl font-black text-white mb-2">{title}</h3>
      <p className="text-slate-500 max-w-sm mb-8 font-medium">
        {description}
      </p>
      {action && action}
    </div>
  );
}
