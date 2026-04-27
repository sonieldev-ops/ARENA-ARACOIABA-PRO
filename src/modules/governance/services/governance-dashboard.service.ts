import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  Timestamp,
  startAt,
  endAt,
  getCountFromServer
} from 'firebase/firestore';
import { db } from '@/src/lib/firebase/client';
import { UserRole, UserStatus } from '@/src/types/auth';
import {
  GovernanceSummary,
  GovernanceFilterState,
  GovernanceKpi,
  RecentAuditItem
} from '../types/governance.types';

export class GovernanceDashboardService {
  /**
   * Obtém um resumo consolidado de governança.
   * Em produção, isso deve ler de um documento pré-agregado (ex: governanceMetrics/latest)
   * Para este MVP, faremos agregação on-demand com limites.
   */
  async getSummary(filters: GovernanceFilterState): Promise<GovernanceSummary> {
    // 1. Obter KPIs Básicos via Count Queries (Baixo custo no Firestore)
    const [pendingCount, activeCount, blockedCount, suspendedCount] = await Promise.all([
      this.getCount('users', where('status', '==', UserStatus.PENDING_APPROVAL)),
      this.getCount('users', where('status', '==', UserStatus.ACTIVE)),
      this.getCount('users', where('status', '==', UserStatus.BLOCKED)),
      this.getCount('users', where('status', '==', UserStatus.SUSPENDED)),
    ]);

    // 2. Buscar Auditoria Recente
    const auditLogs = await this.getRecentAuditLogs(20);

    // 3. Gerar Alertas Dinâmicos baseados nos dados
    const alerts = this.generateAlerts(pendingCount, blockedCount);

    return {
      kpis: [
        { label: 'Pendentes', value: pendingCount, variant: 'warning', description: 'Usuários aguardando aprovação', link: '/admin/usuarios?status=PENDING_APPROVAL' },
        { label: 'Ativos', value: activeCount, variant: 'success', description: 'Usuários com acesso total' },
        { label: 'Bloqueados', value: blockedCount, variant: 'destructive', description: 'Acessos revogados por segurança' },
        { label: 'Suspensos', value: suspendedCount, variant: 'info', description: 'Acessos temporariamente inativos' },
      ],
      alerts,
      statusDistribution: [
        { status: UserStatus.ACTIVE, count: activeCount, color: '#10b981' },
        { status: UserStatus.PENDING_APPROVAL, count: pendingCount, color: '#f59e0b' },
        { status: UserStatus.BLOCKED, count: blockedCount, color: '#ef4444' },
        { status: UserStatus.SUSPENDED, count: suspendedCount, color: '#3b82f6' },
      ],
      recentAudit: auditLogs,
      topOperators: [], // Seria calculado a partir de logs agregados
      charts: {
        auditActions: [],
        roleChanges: []
      }
    };
  }

  private async getCount(coll: string, ...queryConstraints: any[]) {
    const collRef = collection(db, coll);
    const q = query(collRef, ...queryConstraints);
    const snapshot = await getCountFromServer(q);
    return snapshot.data().count;
  }

  private async getRecentAuditLogs(limitCount: number): Promise<RecentAuditItem[]> {
    // 1. Buscar logs administrativos (usuários)
    const qAdmin = query(
      collection(db, 'logs_auditoria'),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    // 2. Buscar logs de partidas (eventos, placares)
    const qMatch = query(
      collection(db, 'match_audit_logs'),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );

    const [adminSnap, matchSnap] = await Promise.all([
      getDocs(qAdmin),
      getDocs(qMatch)
    ]);

    const adminLogs = adminSnap.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        actorUserId: data.actorUserId,
        actorName: data.userName || 'Administrador',
        targetUserId: data.targetUserId,
        targetName: data.targetName || 'Sistema',
        action: data.action,
        reason: data.reason,
        createdAt: data.createdAt,
        correlationId: data.correlationId
      };
    });

    const matchLogs = matchSnap.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        actorUserId: data.userId,
        actorName: data.userName || 'Árbitro',
        targetUserId: data.matchId,
        targetName: data.matchName || `Partida ${data.matchId?.substring(0, 5)}`,
        action: data.action,
        reason: data.details || '',
        createdAt: data.timestamp,
        correlationId: data.matchId
      };
    });

    // Combinar e ordenar por data decrescente
    const combined = [...adminLogs, ...matchLogs].sort((a, b) => {
      const timeA = a.createdAt?.seconds || 0;
      const timeB = b.createdAt?.seconds || 0;
      return timeB - timeA;
    });

    return combined.slice(0, limitCount);
  }

  private generateAlerts(pending: number, blocked: number): any[] {
    const alerts = [];
    if (pending > 10) {
      alerts.push({
        id: 'too-many-pending',
        severity: 'high',
        title: 'Fila de aprovação acumulada',
        message: `Existem ${pending} usuários aguardando aprovação. O tempo de resposta pode estar acima do SLA.`,
        actionLabel: 'Ver Pendentes',
        actionUrl: '/admin/usuarios?status=PENDING_APPROVAL'
      });
    }
    if (blocked > 0) {
       alerts.push({
         id: 'recent-blocks',
         severity: 'medium',
         title: 'Usuários Bloqueados',
         message: `Há ${blocked} usuários bloqueados no sistema. Revise se há incidentes de segurança.`,
       });
    }
    return alerts;
  }
}

export const governanceService = new GovernanceDashboardService();
