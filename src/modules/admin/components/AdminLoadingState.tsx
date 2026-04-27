'use client';

import { Loader2 } from 'lucide-react';

export function AdminLoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 animate-in fade-in duration-500">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-slate-800 border-t-red-600 rounded-full animate-spin" />
        <Loader2 className="h-6 w-6 text-red-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
      </div>
      <p className="mt-4 text-slate-500 font-bold tracking-widest uppercase text-xs">
        Carregando dados...
      </p>
    </div>
  );
}
