'use client';

import React, { useEffect, useState } from 'react';
import { useSessionRevalidator } from '@/hooks/useSessionRevalidator';
import { UserRole, UserStatus } from '@/src/types/auth';

interface SessionRefreshBoundaryProps {
  children: React.ReactNode;
  serverAccessVersion: number;
  serverRole: UserRole;
  serverStatus: UserStatus;
}

/**
 * Componente que detecta descompasso entre o Cookie (Server) e o ID Token (Client).
 * Se o Server informar uma versão/role diferente, ele força o refresh do token no client.
 */
export function SessionRefreshBoundary({
  children,
  serverAccessVersion,
  serverRole,
  serverStatus,
}: SessionRefreshBoundaryProps) {
  const { forceRefresh } = useSessionRevalidator();
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    async function checkConsistency() {
      // Pequeno delay para garantir que o Auth do Firebase inicializou no client
      await new Promise(r => setTimeout(r, 500));

      const { auth } = await import('@/lib/firebase/client');
      const user = auth.currentUser;

      if (user) {
        const tokenResult = await user.getIdTokenResult();
        const clientVersion = (tokenResult.claims.accessVersion as number) || 0;
        const clientRole = (tokenResult.claims.role as UserRole) || UserRole.PUBLIC_USER;
        const clientStatus = (tokenResult.claims.status as UserStatus) || UserStatus.PENDING_APPROVAL;

        // Se houver mismatch, forçamos o refresh
        if (
          clientVersion < serverAccessVersion ||
          clientRole !== serverRole ||
          clientStatus !== serverStatus
        ) {
          console.log('Detectada inconsistência de sessão. Forçando refresh...');
          setIsRefreshing(true);
          await forceRefresh();
          setIsRefreshing(false);
        }
      }
    }

    checkConsistency();
  }, [serverAccessVersion, serverRole, serverStatus, forceRefresh]);

  if (isRefreshing) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-sm text-muted-foreground font-medium">Atualizando permissões de acesso...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
