'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { auth } from '@/lib/firebase/client';
import { Loader2, Trophy } from 'lucide-react';

export default function RankingDeepLinkPage() {
  const params = useParams();
  const championshipId = params.championshipId as string;
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        sessionStorage.setItem('redirect_after_login', `/ranking/${championshipId}`);
        router.push('/login');
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [championshipId, router]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <div className="bg-amber-100 p-3 rounded-full">
          <Trophy className="w-8 h-8 text-amber-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Classificação</h1>
          <p className="text-slate-500">Campeonato ID: {championshipId}</p>
        </div>
      </div>

      <div className="bg-white p-12 rounded-2xl border shadow-sm text-center">
        <p className="text-slate-400">Carregando tabela de classificação oficial...</p>
      </div>
    </div>
  );
}
