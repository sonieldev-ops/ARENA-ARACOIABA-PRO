import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '../services/auth.service';
import { UserRole } from '@/types/auth';
import { toast } from 'sonner';

export function useRegister() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const register = async (data: {
    email: string;
    pass: string;
    fullName: string;
    phone?: string;
    requestedRole: UserRole
  }) => {
    setLoading(true);
    setError(null);
    try {
      await authService.register(data);
      toast.success('Cadastro realizado! Sua conta está em análise.');
      router.replace('/pending-approval');
    } catch (err: any) {
      const msg = authService.getFriendlyErrorMessage(err);
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return { register, loading, error };
}
