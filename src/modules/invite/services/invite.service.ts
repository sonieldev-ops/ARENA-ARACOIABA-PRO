import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  updateDoc
} from 'firebase/firestore';
import { db } from '@/src/lib/firebase/client';
import { removeUndefined } from '@/src/lib/utils';
import { InviteDetails } from '../types/invite.types';

export class InviteService {
  async validateInvite(inviteId: string): Promise<InviteDetails> {
    const inviteRef = doc(db, 'teamInvites', inviteId);
    const inviteSnap = await getDoc(inviteRef);

    if (!inviteSnap.exists()) {
      throw new Error('Convite não encontrado.');
    }

    const data = inviteSnap.data();

    if (data.status !== 'PENDING') {
      throw new Error(`Este convite já foi ${data.status === 'ACCEPTED' ? 'aceito' : 'recusado'}.`);
    }

    // Opcional: Validar expiração aqui se houver expiresAt
    if (data.expiresAt && data.expiresAt.toDate() < new Date()) {
       throw new Error('Este convite expirou.');
    }

    return { id: inviteSnap.id, ...data } as InviteDetails;
  }

  async rejectInvite(inviteId: string): Promise<void> {
    const inviteRef = doc(db, 'teamInvites', inviteId);
    await updateDoc(inviteRef, removeUndefined({
      status: 'REJECTED',
      rejectedAt: new Date()
    }));
  }

  async acceptInvite(inviteId: string, userId: string): Promise<void> {
    const response = await fetch('/api/invite/accept', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ inviteId, userId })
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || 'Erro ao aceitar convite');
    }
  }
}

export const inviteService = new InviteService();
