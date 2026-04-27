import * as admin from 'firebase-admin';
import {
  NotificationType,
  NotificationChannel,
  NotificationDeliveryStatus,
  AdminNotificationMetadata,
  NotificationPriority
} from '../../../src/modules/notifications/types/notification.types';
import { ADMIN_NOTIFICATION_TEMPLATES } from '../../../src/modules/notifications/templates/admin-notifications.templates';

/**
 * Orquestrador de Notificações Administrativas
 * Responsável por decidir canais, templates e persistência
 */
export async function orchestrateAdminNotification(
  targetUid: string,
  type: NotificationType,
  metadata: AdminNotificationMetadata,
  extraData?: any
) {
  const db = admin.firestore();
  const notificationId = `notif_${metadata.correlationId}_${type}`;

  // 1. Verificar idempotência
  const existingNotif = await db.collection('notificacoes').doc(notificationId).get();
  if (existingNotif.exists) {
    console.log(`Notificação ${notificationId} já processada. Ignorando.`);
    return;
  }

  // 2. Buscar dados do usuário alvo
  const userDoc = await db.collection('usuarios').doc(targetUid).get();
  if (!userDoc.exists) {
    console.error(`Usuário ${targetUid} não encontrado para notificação.`);
    return;
  }
  const userData = userDoc.data()!;

  // 3. Resolver Template
  const templateFn = ADMIN_NOTIFICATION_TEMPLATES[type];
  if (!templateFn) {
    console.error(`Template não encontrado para tipo ${type}`);
    return;
  }
  const template = templateFn({ ...userData, ...metadata, ...extraData });

  // 4. Decidir Canais (Lógica de Negócio: Críticos sempre mandam push/email se possível)
  const channels: NotificationChannel[] = [NotificationChannel.IN_APP];
  if (template.priority === NotificationPriority.HIGH || template.priority === NotificationPriority.CRITICAL) {
    channels.push(NotificationChannel.PUSH);
    channels.push(NotificationChannel.EMAIL);
  }

  // 5. Preparar Status dos Canais
  const channelStatus = channels.map(channel => ({
    channel,
    status: NotificationDeliveryStatus.PENDING
  }));

  // 6. Persistir Notificação (In-App)
  const notification = {
    id: notificationId,
    userId: targetUid,
    type,
    title: template.title,
    message: template.body,
    priority: template.priority,
    isRead: false,
    channels,
    channelStatus,
    metadata,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  await db.collection('notificacoes').doc(notificationId).set(notification);

  // 7. Disparo Assíncrono dos Canais
  const results = await Promise.allSettled(channels.map(async (channel) => {
    if (channel === NotificationChannel.IN_APP) {
       return updateChannelStatus(notificationId, channel, NotificationDeliveryStatus.SENT);
    }

    if (channel === NotificationChannel.PUSH) {
       return sendPush(targetUid, template.title, template.body, { type, correlationId: metadata.correlationId });
    }

    if (channel === NotificationChannel.EMAIL) {
       return sendEmail(userData.email, template.title, template.body);
    }
  }));

  return results;
}

/**
 * Atualiza o status de entrega de um canal específico
 */
async function updateChannelStatus(
  notificationId: string,
  channel: NotificationChannel,
  status: NotificationDeliveryStatus,
  error?: string
) {
  const db = admin.firestore();
  const notifRef = db.collection('notificacoes').doc(notificationId);

  const doc = await notifRef.get();
  if (!doc.exists) return;

  const currentStatus = doc.data()?.channelStatus || [];
  const updatedStatus = currentStatus.map((s: any) =>
    s.channel === channel ? { ...s, status, sentAt: admin.firestore.FieldValue.serverTimestamp(), error } : s
  );

  await notifRef.update({ channelStatus: updatedStatus });
}

/**
 * Mock/Interface de envio Push (FCM)
 */
async function sendPush(uid: string, title: string, body: string, data: any) {
  // Buscar tokens do usuário
  const db = admin.firestore();
  const devicesSnap = await db.collection('userDevices').where('userId', '==', uid).get();

  if (devicesSnap.empty) {
     console.log(`Usuário ${uid} sem tokens de dispositivo. Ignorando push.`);
     return;
  }

  const tokens = devicesSnap.docs.map(doc => doc.data().fcmToken);

  try {
    const response = await admin.messaging().sendEachForMulticast({
      tokens,
      notification: { title, body },
      data: { ...data, click_action: 'FLUTTER_NOTIFICATION_CLICK' }
    });

    console.log(`Push enviado para ${uid}. Sucessos: ${response.successCount}, Falhas: ${response.failureCount}`);
  } catch (err: any) {
    console.error('Erro ao enviar push FCM:', err);
    throw err;
  }
}

/**
 * Mock/Interface de envio de Email
 */
async function sendEmail(email: string, title: string, body: string) {
  // Aqui integraria com SendGrid, Mailgun ou Firebase Email Extension
  console.log(`Email enviado para ${email}: ${title}`);
}
