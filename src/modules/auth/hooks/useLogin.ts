import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authService } from '../services/auth.service';
import { UserStatus, UserRole } from '@/types/auth';
import { toast } from 'sonner';

export function useLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextParam = searchParams.get('next');

  const handleRedirect = (status: UserStatus, role: UserRole) => {
    // 1. Prioridade para redirecionamento solicitado via URL (apenas se ativo)
    if (nextParam && status === UserStatus.ACTIVE) {
      router.replace(nextParam);
      return;
    }

    // 2. Fluxo por Status
    switch (status) {
      case UserStatus.PENDING_APPROVAL:
        router.replace('/pending-approval');
        return;
      case UserStatus.SUSPENDED:
      case UserStatus.BLOCKED:
      case UserStatus.REJECTED:
        // O formulário cuidará de exibir a mensagem, mas podemos redirecionar para um help center se existir
        return;
      case UserStatus.ACTIVE:
        // Redirecionamento por Role
        if (role === UserRole.SUPER_ADMIN || role === UserRole.ORGANIZER) {
          router.replace('/admin/dashboard');
        } else {
          router.replace('/dashboard');
        }
        return;
      default:
        router.replace('/');
    }
  };

  const login = async (email: string, pass: string) => {
    setLoading(true);
    setError(null);

    try {
      const user = await authService.login(email, pass);

      // Validação de Status Impeditivos
      if (user.status === UserStatus.BLOCKED) {
        setError('Sua conta está bloqueada. Entre em contato com o suporte.');
        await authService.logout();
        return;
      }
      if (user.status === UserStatus.SUSPENDED) {
        setError('Sua conta está suspensa temporariamente.');
        await authService.logout();
        return;
      }
      if (user.status === UserStatus.REJECTED) {
        setError('Sua solicitação de cadastro foi rejeitada.');
        await authService.logout();
        return;
      }

      toast.success(`Bem-vindo, ${user.fullName.split(' ')[0]}!`);
      handleRedirect(user.status, user.role);
    } catch (err: any) {
      const msg = authService.getFriendlyErrorMessage(err);
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return { login, loading, error };
}
