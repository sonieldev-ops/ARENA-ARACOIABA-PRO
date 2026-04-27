import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  onSnapshot,
  doc,
  updateDoc,
  writeBatch,
  Timestamp,
  startAfter,
  QueryDocumentSnapshot,
  increment,
  setDoc
} from 'firebase/firestore';
import { db } from '@/src/lib/firebase/client';
import { removeUndefined } from '@/src/lib/utils';
import { NotificationItem, NotificationFilterState, NotificationCounters } from '../types/notification.types';

const NOTIFICATIONS_COLLECTION = 'notifications';

export const notificationsService = {
  /**
   * Listen to unread count in real-time
   */
  listenUnreadCount(userId: string, callback: (count: number) => void) {
    const metaRef = doc(db, `users/${userId}/metadata/notifications`);
    return onSnapshot(metaRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as NotificationCounters;
        callback(data.unreadCount || 0);
      } else {
        callback(0);
      }
    });
  },

  /**
   * Listen to recent notifications
   */
  listenRecentNotifications(userId: string, limitCount: number = 5, callback: (notifications: NotificationItem[]) => void) {
    const notificationsRef = collection(db, `users/${userId}/${NOTIFICATIONS_COLLECTION}`);
    const q = query(
      notificationsRef,
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    return onSnapshot(q, (snapshot) => {
      const notifications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as NotificationItem[];
      callback(notifications);
    });
  },

  /**
   * List notifications with pagination and filters
   */
  async listNotifications(
    userId: string,
    filters: NotificationFilterState,
    pageSize: number = 20,
    lastVisible?: QueryDocumentSnapshot
  ) {
    const notificationsRef = collection(db, `users/${userId}/${NOTIFICATIONS_COLLECTION}`);
    let q = query(notificationsRef, orderBy('createdAt', 'desc'));

    if (filters.isRead !== undefined) {
      q = query(q, where('isRead', '==', filters.isRead));
    }
    if (filters.category && filters.category.length > 0) {
      q = query(q, where('category', 'in', filters.category));
    }
    if (filters.priority && filters.priority.length > 0) {
      q = query(q, where('priority', 'in', filters.priority));
    }

    if (lastVisible) {
      q = query(q, startAfter(lastVisible));
    }

    q = query(q, limit(pageSize));

    const snapshot = await getDocs(q);
    const notifications = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as NotificationItem[];

    return {
      notifications,
      lastVisible: snapshot.docs[snapshot.docs.length - 1]
    };
  },

  /**
   * Mark a single notification as read
   */
  async markAsRead(userId: string, notificationId: string) {
    const docRef = doc(db, `users/${userId}/${NOTIFICATIONS_COLLECTION}`, notificationId);
    const metaRef = doc(db, `users/${userId}/metadata/notifications`);

    const batch = writeBatch(db);
    batch.update(docRef, removeUndefined({
      isRead: true,
      readAt: Timestamp.now()
    }));

    // Decrement unread count atomically
    batch.set(metaRef, removeUndefined({
      unreadCount: increment(-1),
      lastUpdatedAt: Timestamp.now()
    }), { merge: true });

    await batch.commit();
  },

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userId: string) {
    // This is better handled via a Cloud Function for large volumes,
    // but for client-side we can do it for the current unread set if small.
    // For "Arena Aracoiaba Pro", we'll assume a Cloud Function 'markAllNotificationsAsRead'
    // exists to handle this safely and avoid many client writes.
    // For now, let's implement a batch of the most recent unread.

    const notificationsRef = collection(db, `users/${userId}/${NOTIFICATIONS_COLLECTION}`);
    const q = query(notificationsRef, where('isRead', '==', false), limit(100));
    const snapshot = await getDocs(q);

    if (snapshot.empty) return;

    const batch = writeBatch(db);
    snapshot.docs.forEach(d => {
      batch.update(d.ref, removeUndefined({ isRead: true, readAt: Timestamp.now() }));
    });

    const metaRef = doc(db, `users/${userId}/metadata/notifications`);
    batch.set(metaRef, removeUndefined({
      unreadCount: 0,
      lastUpdatedAt: Timestamp.now()
    }), { merge: true });

    await batch.commit();
  }
};
