'use client';

import { useEffect } from 'react';
import { useAuth } from '@/src/modules/auth/context/AuthContext';
import { Capacitor } from '@capacitor/core';
import { toast } from 'sonner';

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
      // Uso de strings e acesso global para evitar falha de build por falta do pacote
      // Em tempo de execução no Android, o Capacitor proverá os plugins se configurado
      const globalCap = (window as any).Capacitor;
      const PushNotifications = globalCap?.Plugins?.PushNotifications;

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

      PushNotifications.addListener('registration', async (token: any) => {
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

      PushNotifications.addListener('pushNotificationReceived', (notification: any) => {
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
