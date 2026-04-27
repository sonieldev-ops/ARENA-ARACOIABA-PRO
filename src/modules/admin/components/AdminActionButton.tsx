'use client';

import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';
import { Button, ButtonProps } from '@/components/ui/button';
import { cn } from '@/src/lib/utils';

interface AdminActionButtonProps extends ButtonProps {
  icon?: LucideIcon;
  children: ReactNode;
}

export function AdminActionButton({
  icon: Icon,
  children,
  className,
  variant = "default",
  ...props
}: AdminActionButtonProps) {
  return (
    <Button
      variant={variant}
      className={cn(
        "gap-2 font-bold rounded-xl transition-all active:scale-95",
        variant === "default" && "bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-900/20 border-none",
        variant === "outline" && "border-slate-800 bg-slate-900/50 hover:bg-slate-800 text-slate-300",
        className
      )}
      {...props}
    >
      {Icon && <Icon className="h-4 w-4" />}
      {children}
    </Button>
  );
}
