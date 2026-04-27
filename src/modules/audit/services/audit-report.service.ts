import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  startAfter,
  Timestamp,
  doc,
  getDoc
} from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { AuditLogItem, AuditFilterState, AuditSummary } from '../types/audit-report.types';

const AUDIT_COLLECTION = 'adminAuditLogs';

export class AuditReportService {
  /**
   * Lista logs de auditoria com filtros e paginação
   */
  async listAuditLogs(
    filters: AuditFilterState,
    pageSize: number = 50,
    lastDoc?: any
  ): Promise<{ items: AuditLogItem[]; lastVisible: any }> {
    let q = query(collection(db, AUDIT_COLLECTION));

    // Filtros de Data (Essenciais para performance e custo)
    if (filters.startDate) {
      q = query(q, where('createdAt', '>=', Timestamp.fromDate(filters.startDate)));
    }
    if (filters.endDate) {
      q = query(q, where('createdAt', '<=', Timestamp.fromDate(filters.endDate)));
    }

    // Filtros de Igualdade (Podem ser combinados se houver índices compostos)
    if (filters.actorUserId) {
      q = query(q, where('actorUserId', '==', filters.actorUserId));
    }
    if (filters.targetUserId) {
      q = query(q, where('targetUserId', '==', filters.targetUserId));
    }
    if (filters.action) {
      q = query(q, where('action', '==', filters.action));
    }
    if (filters.correlationId) {
      q = query(q, where('correlationId', '==', filters.correlationId));
    }
    if (filters.severity) {
      q = query(q, where('severity', '==', filters.severity));
    }

    // Ordenação e Limite
    q = query(q, orderBy('createdAt', 'desc'), limit(pageSize));

    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }

    const snapshot = await getDocs(q);
    const items = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as AuditLogItem));

    return {
      items,
      lastVisible: snapshot.docs[snapshot.docs.length - 1]
    };
  }

  /**
   * Obtém um resumo dos eventos no período
   */
  async getAuditSummary(startDate: Date, endDate: Date): Promise<AuditSummary> {
    const q = query(
      collection(db, AUDIT_COLLECTION),
      where('createdAt', '>=', Timestamp.fromDate(startDate)),
      where('createdAt', '<=', Timestamp.fromDate(endDate))
    );

    const snapshot = await getDocs(q);
    const summary: AuditSummary = {
      totalEvents: snapshot.size,
      criticalEvents: 0,
      uniqueOperators: 0,
      actionBreakdown: {},
      sourceBreakdown: {}
    };

    const operators = new Set<string>();

    snapshot.forEach(doc => {
      const data = doc.data() as AuditLogItem;

      if (data.severity === 'CRITICAL' || data.severity === 'HIGH') {
        summary.criticalEvents++;
      }

      operators.add(data.actorUserId);

      summary.actionBreakdown[data.action] = (summary.actionBreakdown[data.action] || 0) + 1;
      summary.sourceBreakdown[data.source] = (summary.sourceBreakdown[data.source] || 0) + 1;
    });

    summary.uniqueOperators = operators.size;
    return summary;
  }

  /**
   * Busca todos os eventos relacionados a um CorrelationId
   */
  async getByCorrelationId(correlationId: string): Promise<AuditLogItem[]> {
    const q = query(
      collection(db, AUDIT_COLLECTION),
      where('correlationId', '==', correlationId),
      orderBy('createdAt', 'asc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AuditLogItem));
  }

  /**
   * Resolução de nomes/emails (Pode ser otimizado com cache ou materialização no log)
   */
  async resolveUserInfo(userId: string) {
    const userDoc = await getDoc(doc(db, 'usuarios', userId));
    if (userDoc.exists()) {
      const data = userDoc.data();
      return {
        name: data.fullName || data.name,
        email: data.email
      };
    }
    return null;
  }
}

export const auditReportService = new AuditReportService();
