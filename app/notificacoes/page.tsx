'use client';

import React from 'react';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useNotifications } from '@/src/modules/notifications/hooks/useNotifications';
import { NotificationItemCard } from '@/src/modules/notifications/components/NotificationItemCard';
import { CheckCheck, Filter, BellOff } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function NotificationsPage() {
  const { data } = useCurrentUser();
  const user = data?.user;
  const router = useRouter();
  const {
    notifications,
    loading,
    hasMore,
    loadMore,
    markAsRead,
    markAllAsRead,
    filters,
    setFilters
  } = useNotifications(user?.id);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notificações</h1>
          <p className="text-gray-500 mt-1">
            Você tem <span className="font-semibold text-brand-600">{unreadCount}</span> notificações não lidas
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-all"
          >
            <CheckCheck size={18} />
            Marcar todas como lidas
          </button>
        </div>
      </header>

      {/* Filtros Rápidos */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setFilters({ ...filters, isRead: undefined })}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
            filters.isRead === undefined ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Todas
        </button>
        <button
          onClick={() => setFilters({ ...filters, isRead: false })}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
            filters.isRead === false ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Não lidas
        </button>
        <button
          onClick={() => setFilters({ ...filters, isRead: true })}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
            filters.isRead === true ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Lidas
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading && notifications.length === 0 ? (
          <div className="p-12 space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex gap-4 animate-pulse">
                <div className="w-10 h-10 bg-gray-100 rounded-full" />
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-4 bg-gray-100 rounded w-1/4" />
                  <div className="h-4 bg-gray-100 rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length > 0 ? (
          <>
            <div className="divide-y divide-gray-100">
              {notifications.map(n => (
                <NotificationItemCard
                  key={n.id}
                  notification={n}
                  onClick={(notif) => {
                    if (!notif.isRead) markAsRead(notif.id);
                    if (notif.deepLinkWeb) router.push(notif.deepLinkWeb);
                  }}
                  onMarkRead={markAsRead}
                />
              ))}
            </div>

            {hasMore && (
              <div className="p-4 bg-gray-50 text-center">
                <button
                  onClick={loadMore}
                  className="text-sm font-bold text-brand-600 hover:text-brand-700"
                >
                  Carregar mais
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center p-20 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-300">
              <BellOff size={40} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Nada por aqui</h3>
            <p className="text-gray-500 max-w-xs mt-1">
              Você não tem nenhuma notificação que corresponda aos filtros selecionados.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
