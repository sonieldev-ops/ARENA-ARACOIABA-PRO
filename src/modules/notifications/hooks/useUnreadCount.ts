import { useState, useEffect } from 'react';
import { notificationsService } from '../services/notifications.service';

export function useUnreadCount(userId: string | undefined) {
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    const unsubscribe = notificationsService.listenUnreadCount(userId, (count) => {
      setUnreadCount(count);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  return { unreadCount, loading };
}
