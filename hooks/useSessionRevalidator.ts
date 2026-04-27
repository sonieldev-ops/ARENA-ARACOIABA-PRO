'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { auth } from '@/lib/firebase/client';
import { onIdTokenChanged } from 'firebase/auth';

/**
 * Hook para monitorar e revalidar a sessão client-side.
 * Ele detecta mudanças no ID Token (como novas claims) e sincroniza com o session cookie.
 */
export function useSessionRevalidator() {
  const router = useRouter();
  const pathname = usePathname();

  const isRefreshing = useRef(false);
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  const refreshSession = useCallback(async (idToken: string) => {
    if (isRefreshing.current || !mounted.current) return;
    isRefreshing.current = true;

    try {
      const res = await fetch('/api/auth/refresh-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });

      if (res.ok) {
        // Envolve em um setTimeout para garantir que o router já está inicializado
        setTimeout(() => {
          if (mounted.current) router.refresh();
        }, 100);
      } else if (res.status === 401) {
        setTimeout(() => {
          if (mounted.current) router.push(`/login?callbackUrl=${encodeURIComponent(pathname)}`);
        }, 100);
      }
    } catch (error) {
      console.error('Falha ao sincronizar sessão:', error);
    } finally {
      // Pequeno delay para evitar loops infinitos de refresh
      setTimeout(() => {
        isRefreshing.current = false;
      }, 2000);
    }
  }, [router, pathname]);

  useEffect(() => {
    // Escuta mudanças no token (incluindo expiração e refresh manual)
    const unsubscribe = onIdTokenChanged(auth, async (user) => {
      if (user) {
        const idToken = await user.getIdToken();
        const decodedToken = await user.getIdTokenResult();

        // Verificamos se há um marcador de que as claims mudaram ou se a versão de acesso mudou
        // O Firebase Auth injeta as claims no IdTokenResult.
        // Se detectarmos que as claims do client estão diferentes das do cookie (que detectaremos no layout/middleware),
        // o SessionRefreshBoundary entrará em ação.

        // Aqui apenas garantimos que sempre que o token mudar no Firebase Auth,
        // tentamos sincronizar com o cookie se necessário.
        await refreshSession(idToken);
      }
    });

    return () => unsubscribe();
  }, [refreshSession]);

  /**
   * Força um refresh total da sessão obtendo um novo token do Firebase
   */
  const forceRefresh = useCallback(async () => {
    if (!auth.currentUser) return;

    // forceRefresh: true obriga o Firebase a buscar novas claims no servidor
    const idToken = await auth.currentUser.getIdToken(true);
    await refreshSession(idToken);
  }, [refreshSession]);

  return { forceRefresh };
}
