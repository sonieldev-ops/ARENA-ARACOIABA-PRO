import { getMessaging } from "firebase-admin/messaging";
import { adminDb } from "@/src/lib/firebase/admin";

export interface PushPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
}

export class NotificationService {
  /**
   * Envia uma notificação push para múltiplos tokens FCM.
   */
  static async sendPush(tokens: string[], payload: PushPayload) {
    if (!tokens || tokens.length === 0) {
      console.log("[NotificationService] Nenhum token para envio.");
      return;
    }

    const message = {
      notification: {
        title: payload.title,
        body: payload.body,
      },
      data: payload.data,
      tokens: tokens,
    };

    try {
      const response = await getMessaging().sendEachForMulticast(message);
      console.log(`[NotificationService] ${response.successCount} mensagens enviadas com sucesso.`);

      if (response.failureCount > 0) {
        const failedTokens: string[] = [];
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            failedTokens.push(tokens[idx]);
          }
        });
        console.warn(`[NotificationService] Falha em ${response.failureCount} tokens:`, failedTokens);
      }

      return response;
    } catch (error) {
      console.error("[NotificationService] Erro ao enviar push multicast:", error);
      throw error;
    }
  }

  /**
   * Busca tokens de todos os membros de um time para enviar notificação.
   */
  static async getTeamTokens(teamId: string): Promise<string[]> {
    const usersSnap = await adminDb
      .collection("users")
      .where("teamId", "==", teamId)
      .get();

    const tokens: string[] = [];
    usersSnap.forEach((doc) => {
      const data = doc.data();
      if (data.fcmToken) {
        tokens.push(data.fcmToken);
      }
    });

    return tokens;
  }
}
