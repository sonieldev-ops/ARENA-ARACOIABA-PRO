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
import { db } from '@/lib/firebase/config';
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
        { label: 'Pendentes', value: pendingCount, variant: 'warning', description: 'Usuários aguardando aprovação', link: '/admin/users?status=PENDING_APPROVAL' },
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
    const q = query(
      collection(db, 'adminAuditLogs'),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    const snap = await getDocs(q);

    // Em produção, faríamos join com nomes de usuários ou salvaríamos denormalizado no log
    return snap.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        actorUserId: data.actorUserId,
        actorName: 'Operador', // TODO: Fetch ou Denormalize
        targetUserId: data.targetUserId,
        targetName: 'Usuário Alvo',
        action: data.action,
        reason: data.reason,
        createdAt: data.createdAt,
        correlationId: data.correlationId
      };
    });
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
        actionUrl: '/admin/users?status=PENDING_APPROVAL'
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
