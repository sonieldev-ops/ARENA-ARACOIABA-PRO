import { db } from '@/src/lib/firebase/client';
import { 
  doc, 
  setDoc, 
  serverTimestamp, 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs, 
  Timestamp, 
  startAfter,
  QueryDocumentSnapshot
} from 'firebase/firestore';

export interface NotificationFilterState {
  type?: string;
  startDate?: Date;
  endDate?: Date;
  isRead?: boolean;
  priority?: string;
}

export const FCMService = {
  /**
   * Registra o token FCM do usuário para receber pushes nativos
   */
  async registerToken(userId: string, token: string, platform: 'android' | 'ios' | 'web') {
    const tokenRef = doc(db, 'fcm_tokens', token);
    await setDoc(tokenRef, {
      userId,
      token,
      platform,
      active: true,
      lastUpdated: serverTimestamp()
    });
  },

  /**
   * Envia uma notificação para um tópico (ex: campeonato ou time)
   * Nota: Em produção isso é feito via Cloud Functions.
   * Aqui criamos o registro para a Function processar.
   */
  async notifyEvent(type: string, data: any) {
    await addDoc(collection(db, 'queued_notifications'), {
      type,
      data,
      status: 'pending',
      createdAt: serverTimestamp()
    });
  },

  /**
   * Busca notificações do usuário com filtros avançados e paginação
   */
  async getUserNotifications(
    userId: string, 
    filters: NotificationFilterState, 
    pageSize: number = 20,
    lastVisible?: QueryDocumentSnapshot
  ) {
    // Referência base: subcoleção de notificações do usuário
    let q = query(
      collection(db, `usuarios/${userId}/notificacoes`),
      orderBy('createdAt', 'desc')
    );

    // Filtro por Tipo (ex: MATCH_GOAL, SYSTEM_ALERT)
    if (filters.type && filters.type !== 'ALL') {
      q = query(q, where('type', '==', filters.type));
    }

    // Filtro por Status de Leitura
    if (filters.isRead !== undefined) {
      q = query(q, where('read', '==', filters.isRead));
    }

    // Filtro por Período
    if (filters.startDate) {
      q = query(q, where('createdAt', '>=', Timestamp.fromDate(filters.startDate)));
    }
    if (filters.endDate) {
      q = query(q, where('createdAt', '<=', Timestamp.fromDate(filters.endDate)));
    }

    // Paginação e Limite
    if (lastVisible) {
      q = query(q, startAfter(lastVisible));
    }
    q = query(q, limit(pageSize));

    const snapshot = await getDocs(q);
    return {
      items: snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })),
      lastDoc: snapshot.docs[snapshot.docs.length - 1]
    };
  },

  /**
   * Favoritar um time para receber notificações específicas
   */
  async followTeam(userId: string, teamId: string) {
    await setDoc(doc(db, `usuarios/${userId}/favoritos`, teamId), {
      type: 'team',
      addedAt: serverTimestamp()
    });
  }
};
