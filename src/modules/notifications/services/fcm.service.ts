import { db } from '@/src/lib/firebase/client';
import { doc, setDoc, serverTimestamp, collection, addDoc } from 'firebase/firestore';

export const FCMService = {
  /**
   * Registra o token FCM do usuário para receber pushes nativos
   */
  async registerToken(userId: string, token: string, platform: 'android' | 'ios' | 'web') {
    const tokenRef = doc(db, 'fcm_tokens', token);
    await setDoc(tokenRef, {
      userId,
      token,
      platform,
      active: true,
      lastUpdated: serverTimestamp()
    });
  },

  /**
   * Envia uma notificação para um tópico (ex: campeonato ou time)
   * Nota: Em produção isso é feito via Cloud Functions.
   * Aqui criamos o registro para a Function processar.
   */
  async notifyEvent(type: string, data: any) {
    await addDoc(collection(db, 'queued_notifications'), {
      type,
      data,
      status: 'pending',
      createdAt: serverTimestamp()
    });
  },

  /**
   * Favoritar um time para receber notificações específicas
   */
  async followTeam(userId: string, teamId: string) {
    await setDoc(doc(db, `users/${userId}/favorites`, teamId), {
      type: 'team',
      addedAt: serverTimestamp()
    });
  }
};
