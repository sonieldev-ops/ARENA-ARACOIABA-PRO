'use client';

import { useEffect } from 'react';
import { useAuth } from '@/src/modules/auth/context/AuthContext';
import { Capacitor, WebGLUtils } from '@capacitor/core';
import { toast } from 'sonner';

interface CapacitorPlugins {
  PushNotifications?: {
    checkPermissions: () => Promise<{ receive: string }>;
    requestPermissions: () => Promise<{ receive: string }>;
    register: () => Promise<void>;
    addListener: (eventName: string, callback: (data: any) => void) => void;
  };
}

interface PushRegistrationToken {
  value: string;
}

interface PushNotificationReceived {
  title?: string;
  body?: string;
  data?: Record<string, unknown>;
}

export function FCMHandler() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    if (Capacitor.isNativePlatform()) {
      registerCapacitorPush(user.uid);
    }
  }, [user]);

  const registerCapacitorPush = async (userId: string) => {
    try {
      const plugins = (Capacitor as any).Plugins as CapacitorPlugins;
      const PushNotifications = plugins?.PushNotifications;

      if (!PushNotifications) {
        console.warn('[FCM] Plugin PushNotifications não injetado pelo Capacitor.');
        return;
      }

      let perm = await PushNotifications.checkPermissions();

      if (perm.receive !== 'granted') {
        perm = await PushNotifications.requestPermissions();
      }

      if (perm.receive !== 'granted') return;

      await PushNotifications.register();

      PushNotifications.addListener('registration', async (token: PushRegistrationToken) => {
        await fetch('/api/notifications/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            token: token.value,
            platform: Capacitor.getPlatform()
          }),
        });
      });

      PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationReceived) => {
        toast(notification.title || 'Alerta Arena Pro', {
          description: notification.body,
        });
      });

    } catch (e) {
      console.error('[FCM] Erro ao configurar push:', e);
    }
  };

  return null;
}
