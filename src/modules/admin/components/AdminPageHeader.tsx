import { ReactNode } from 'react';

interface AdminPageHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export function AdminPageHeader({ title, subtitle, action }: AdminPageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
      <div className="space-y-1">
        <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight uppercase italic" data-testid="page-title">
          {title}
        </h1>
        {subtitle && (
          <p className="text-slate-500 font-medium text-sm">
            {subtitle}
          </p>
        )}
      </div>
      {action && (
        <div className="flex items-center gap-3 shrink-0">
          {action}
        </div>
      )}
    </div>
  );
}
