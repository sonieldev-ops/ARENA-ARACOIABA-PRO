import React, { useState, useRef, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { NotificationBadge } from './NotificationBadge';
import { NotificationDropdown } from './NotificationDropdown';
import { useUnreadCount } from '../hooks/useUnreadCount';
import { useAuth } from '@/hooks/useAuth'; // Assumindo que existe

export const NotificationBell: React.FC = () => {
  const { user } = useAuth();
  const { unreadCount } = useUnreadCount(user?.uid);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-500 hover:text-brand-600 hover:bg-brand-50 rounded-full transition-all focus:outline-none"
      >
        <Bell size={24} />
        <NotificationBadge
          count={unreadCount}
          className="absolute top-0 right-0 transform translate-x-1 -translate-y-1 border-2 border-white"
        />
      </button>

      {isOpen && (
        <NotificationDropdown
          userId={user?.uid}
          onClose={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};
