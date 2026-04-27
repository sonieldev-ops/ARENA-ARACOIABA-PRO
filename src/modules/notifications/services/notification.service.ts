import { adminDb, adminMessaging } from "@/src/lib/firebase/admin";

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

    if (!adminMessaging) {
      throw new Error("Serviço de Mensagens do Firebase não inicializado. Verifique as credenciais Admin.");
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
      const response = await adminMessaging.sendEachForMulticast(message);
      console.log(`[NotificationService] ${response.successCount} mensagens enviadas com sucesso.`);

      if (response.failureCount > 0) {
        const failedTokens: string[] = [];
        response.responses.forEach((resp: any, idx: number) => {
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
      .collection("usuarios")
      .where("teamId", "==", teamId)
      .get();

    const tokens: string[] = [];
    usersSnap.forEach((doc: any) => {
      const data = doc.data();
      if (data.fcmToken) {
        tokens.push(data.fcmToken);
      }
    });

    return tokens;
  }

  /**
   * Busca todos os tokens da base, opcionalmente filtrados por role.
   */
  static async getAllTokens(role?: string): Promise<string[]> {
    let query = adminDb.collection("usuarios");
    
    if (role && role !== 'all') {
      // Mapeamento de roles se necessário
      const targetRole = role === 'athletes' ? 'ATHLETE' : 
                         role === 'referees' ? 'REFEREE' : role;
      query = query.where("role", "==", targetRole);
    }

    const usersSnap = await query.get();
    const tokens: string[] = [];
    
    usersSnap.forEach((doc: any) => {
      const data = doc.data();
      if (data.fcmToken) {
        tokens.push(data.fcmToken);
      }
    });

    return tokens;
  }
}
