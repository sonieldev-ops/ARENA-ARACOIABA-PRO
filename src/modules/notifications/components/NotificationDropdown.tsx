import React, { useState, useEffect } from 'react';
import { notificationsService } from '../services/notifications.service';
import { NotificationItem } from '../types/notification.types';
import { NotificationItemCard } from './NotificationItemCard';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface NotificationDropdownProps {
  userId?: string;
  onClose: () => void;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ userId, onClose }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!userId) return;

    const unsubscribe = notificationsService.listenRecentNotifications(userId, 5, (data) => {
      setNotifications(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  const handleNotificationClick = async (notification: NotificationItem) => {
    if (!notification.isRead && userId) {
      await notificationsService.markAsRead(userId, notification.id);
    }

    onClose();

    if (notification.deepLinkWeb) {
      router.push(notification.deepLinkWeb);
    }
  };

  const markAllRead = async () => {
    if (!userId) return;
    await notificationsService.markAllAsRead(userId);
  };

  return (
    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/50">
        <h3 className="font-bold text-gray-900">Notificações</h3>
        {notifications.some(n => !n.isRead) && (
          <button
            onClick={markAllRead}
            className="text-xs font-semibold text-brand-600 hover:text-brand-700"
          >
            Marcar todas como lidas
          </button>
        )}
      </div>

      <div className="max-h-[400px] overflow-y-auto">
        {loading ? (
          <div className="flex flex-col gap-2 p-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-100 animate-pulse rounded-lg" />
            ))}
          </div>
        ) : notifications.length > 0 ? (
          notifications.map(n => (
            <NotificationItemCard
              key={n.id}
              notification={n}
              onClick={handleNotificationClick}
              onMarkRead={(id) => userId && notificationsService.markAsRead(userId, id)}
            />
          ))
        ) : (
          <div className="p-8 text-center">
            <p className="text-gray-500 text-sm">Nenhuma notificação por aqui.</p>
          </div>
        )}
      </div>

      <div className="p-3 bg-gray-50 text-center border-t border-gray-100">
        <Link
          href="/notificacoes"
          onClick={onClose}
          className="text-sm font-bold text-brand-600 hover:text-brand-700"
        >
          Ver todas as notificações
        </Link>
      </div>
    </div>
  );
};
