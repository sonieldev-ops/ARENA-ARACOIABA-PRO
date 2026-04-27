'use client';

import { useState, useEffect, useCallback } from 'react';
import { inviteService } from '../services/invite.service';
import { InviteDetails } from '../types/invite.types';
import { auth } from '@/src/lib/firebase/client';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export function useAcceptInvite(inviteId: string | null) {
  const [invite, setInvite] = useState<InviteDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const router = useRouter();

  const validate = useCallback(async () => {
    if (!inviteId) {
      setError('ID do convite inválido ou ausente.');
      setLoading(false);
      return;
    }

    try {
      const details = await inviteService.validateInvite(inviteId);
      setInvite(details);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [inviteId]);

  useEffect(() => {
    validate();
    const unsubscribe = onAuthStateChanged(auth, setCurrentUser);
    return () => unsubscribe();
  }, [validate]);

  const accept = async () => {
    if (!invite || !currentUser) return;

    // Validar se o e-mail logado é o mesmo do convite (Segurança Extra)
    if (currentUser.email !== invite.invitedEmail) {
      toast.error('Este convite foi enviado para outro e-mail.');
      return;
    }

    try {
      setProcessing(true);
      await inviteService.acceptInvite(invite.id, currentUser.uid);
      toast.success('Bem-vindo ao time!');
      router.push('/dashboard');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setProcessing(false);
    }
  };

  const reject = async () => {
    if (!invite) return;
    try {
      setProcessing(true);
      await inviteService.rejectInvite(invite.id);
      toast.info('Convite recusado.');
      router.push('/');
    } catch (err: any) {
      toast.error('Erro ao recusar convite');
    } finally {
      setProcessing(false);
    }
  };

  return {
    invite,
    loading,
    processing,
    error,
    currentUser,
    actions: { accept, reject }
  };
}
