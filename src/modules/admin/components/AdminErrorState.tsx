'use client';

import { AlertCircle, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AdminErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function AdminErrorState({
  title = "Ops! Algo deu errado",
  message = "Não foi possível carregar os dados. Verifique sua conexão e tente novamente.",
  onRetry
}: AdminErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center bg-red-500/5 rounded-3xl border border-red-500/10">
      <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mb-6 border border-red-500/20">
        <AlertCircle className="h-8 w-8 text-red-500" />
      </div>
      <h3 className="text-xl font-black text-white mb-2">{title}</h3>
      <p className="text-slate-500 max-w-sm mb-8 font-medium">
        {message}
      </p>
      {onRetry && (
        <Button
          onClick={onRetry}
          variant="outline"
          className="gap-2 border-slate-800 hover:bg-slate-800 text-slate-300 rounded-xl"
        >
          <RefreshCcw className="h-4 w-4" />
          Tentar Novamente
        </Button>
      )}
    </div>
  );
}
