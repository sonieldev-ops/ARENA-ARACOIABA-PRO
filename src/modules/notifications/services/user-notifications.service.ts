import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  doc,
  updateDoc,
  onSnapshot,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Notification } from '../types/notification.types';

export class UserNotificationsService {
  private collectionName = 'notifications';

  /**
   * Lista notificações do usuário com real-time (opcional) ou fetch único
   */
  async listUserNotifications(userId: string, limitCount = 20): Promise<Notification[]> {
    const q = query(
      collection(db, this.collectionName),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification));
  }

  /**
   * Marca uma notificação como lida
   */
  async markAsRead(notificationId: string) {
    const ref = doc(db, this.collectionName, notificationId);
    await updateDoc(ref, {
      isRead: true,
      readAt: serverTimestamp()
    });
  }

  /**
   * Marca todas as notificações do usuário como lidas
   */
  async markAllAsRead(userId: string) {
    const q = query(
      collection(db, this.collectionName),
      where('userId', '==', userId),
      where('isRead', '==', false)
    );

    const snapshot = await getDocs(q);
    const batchPromises = snapshot.docs.map(d => this.markAsRead(d.id));
    await Promise.all(batchPromises);
  }

  /**
   * Hook para ouvir notificações em tempo real
   */
  subscribeToNotifications(userId: string, callback: (notifications: Notification[]) => void) {
    const q = query(
      collection(db, this.collectionName),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    return onSnapshot(q, (snapshot) => {
      const notifications = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification));
      callback(notifications);
    });
  }
}

export const userNotificationsService = new UserNotificationsService();
