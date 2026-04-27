'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { auth } from '@/lib/firebase/client';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function MatchDeepLinkPage() {
  const params = useParams();
  const matchId = params.matchId as string;
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Validação de Sessão / Fallback para Login
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        // Guardar a intenção de navegação para após o login
        sessionStorage.setItem('redirect_after_login', `/match/${matchId}`);
        router.push('/login');
      } else {
        setLoading(false);
        // Aqui você carregaria os dados da partida ou redirecionaria para o dashboard de live
        // router.replace(`/dashboard/live/${matchId}`);
      }
    });

    return () => unsubscribe();
  }, [matchId, router]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-slate-500 animate-pulse">Carregando partida...</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Partida: {matchId}</h1>
      <div className="bg-slate-100 p-6 rounded-xl border border-dashed border-slate-300">
        <p className="text-slate-600">
          Você foi redirecionado via Deep Link. Estamos preparando os detalhes da partida {matchId} para você.
        </p>
      </div>
    </div>
  );
}
