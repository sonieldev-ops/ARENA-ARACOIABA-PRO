import React from 'react';
import { NotificationItem } from '../types/notification.types';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  Shield,
  Trophy,
  Activity
} from 'lucide-react';

interface NotificationItemCardProps {
  notification: NotificationItem;
  onClick?: (notification: NotificationItem) => void;
  onMarkRead?: (id: string) => void;
}

const getIcon = (type: string) => {
  switch (type) {
    case 'USER_APPROVED': return <CheckCircle className="text-green-500" />;
    case 'USER_REJECTED': return <XCircle className="text-red-500" />;
    case 'USER_SUSPENDED':
    case 'USER_BLOCKED': return <Shield className="text-red-600" />;
    case 'MATCH_UPDATE': return <Activity className="text-blue-500" />;
    case 'CHAMPIONSHIP_ALERT': return <Trophy className="text-yellow-500" />;
    case 'SYSTEM_NOTICE': return <Info className="text-gray-500" />;
    default: return <AlertCircle className="text-brand-500" />;
  }
};

export const NotificationItemCard: React.FC<NotificationItemCardProps> = ({
  notification,
  onClick,
  onMarkRead
}) => {
  const isUnread = !notification.isRead;

  const getCreatedAt = () => {
    if (!notification.createdAt) return new Date();
    if (typeof (notification.createdAt as any).toDate === 'function') {
      return (notification.createdAt as any).toDate();
    }
    return new Date(notification.createdAt as any);
  };

  return (
    <div
      onClick={() => onClick?.(notification)}
      className={`relative flex items-start p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer ${
        isUnread ? 'bg-brand-50/30' : 'bg-white'
      }`}
    >
      {isUnread && (
        <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-brand-600 rounded-full" />
      )}

      <div className="flex-shrink-0 mr-4 mt-1">
        {getIcon(notification.type)}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h4 className={`text-sm font-semibold truncate ${isUnread ? 'text-gray-900' : 'text-gray-700'}`}>
            {notification.title}
          </h4>
          <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
            {formatDistanceToNow(getCreatedAt(), { addSuffix: true, locale: ptBR })}
          </span>
        </div>
        <p className={`text-sm line-clamp-2 ${isUnread ? 'text-gray-800' : 'text-gray-500'}`}>
          {notification.message}
        </p>

        <div className="mt-2 flex items-center gap-2">
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 uppercase font-medium">
            {notification.category}
          </span>
          {notification.priority === 'HIGH' || notification.priority === 'CRITICAL' ? (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-100 text-red-700 uppercase font-bold">
              {notification.priority}
            </span>
          ) : null}
        </div>
      </div>

      {isUnread && onMarkRead && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onMarkRead(notification.id);
          }}
          className="ml-4 p-1 text-gray-300 hover:text-brand-600 transition-colors"
          title="Marcar como lida"
        >
          <CheckCircle size={18} />
        </button>
      )}
    </div>
  );
};
