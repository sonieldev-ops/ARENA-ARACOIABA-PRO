'use client';

import { useState } from 'react';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { auth } from '@/src/lib/firebase/client';

export function useLogout() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const logout = async (redirectPath: string = '/login') => {
    setLoading(true);
    setError(null);

    try {
      // 1. Firebase Auth Client Sign Out
      await signOut(auth);

      // 2. Chamar o backend para limpar o cookie de sessão
      const res = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        throw new Error('Erro ao limpar sessão no servidor');
      }

      // 3. Forçar refresh completo para limpar estados residuais e redirecionar
      router.push(redirectPath);
      router.refresh();

      // Pequeno atraso para garantir que o redirecionamento inicie
      setTimeout(() => {
        window.location.href = redirectPath;
      }, 100);

    } catch (err) {
      console.error('[Logout Error]:', err);
      setError(err instanceof Error ? err.message : 'Falha ao encerrar sessão');
    } finally {
      setLoading(false);
    }
  };

  return { logout, loading, error };
}
