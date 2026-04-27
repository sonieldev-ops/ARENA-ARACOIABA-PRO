import { useState, useEffect, useCallback } from 'react';
import {
  NotificationItem,
  NotificationFilterState
} from '../types/notification.types';
import { notificationsService } from '../services/notifications.service';
import { QueryDocumentSnapshot } from 'firebase/firestore';

export function useNotifications(userId: string | undefined, initialFilters: NotificationFilterState = {}) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [filters, setFilters] = useState<NotificationFilterState>(initialFilters);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot | undefined>(undefined);

  const loadNotifications = useCallback(async (isNextPage = false) => {
    if (!userId) return;

    if (isNextPage) setLoadingMore(true);
    else setLoading(true);

    try {
      const result = await notificationsService.listNotifications(
        userId,
        filters,
        20,
        isNextPage ? lastDoc : undefined
      );

      setNotifications(prev => isNextPage ? [...prev, ...result.notifications] : result.notifications);
      setLastDoc(result.lastVisible);
      setHasMore(result.notifications.length === 20);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [userId, filters, lastDoc]);

  useEffect(() => {
    loadNotifications();
  }, [userId, filters]);

  const markAsRead = async (id: string) => {
    if (!userId) return;
    await notificationsService.markAsRead(userId, id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const markAllAsRead = async () => {
    if (!userId) return;
    await notificationsService.markAllAsRead(userId);
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  return {
    notifications,
    loading,
    loadingMore,
    hasMore,
    filters,
    setFilters,
    loadMore: () => loadNotifications(true),
    markAsRead,
    markAllAsRead,
    refresh: () => loadNotifications()
  };
}
