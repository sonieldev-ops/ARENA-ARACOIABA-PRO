import {
  collection,
  query,
  where,
  getDocs,
  getCountFromServer,
  orderBy,
  limit,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/src/lib/firebase/client';
import { AdminDashboardData, AuditEvent, AdminDashboardMetrics } from '../types/admin-dashboard.types';
import { UserProfile, UserStatus, UserRole } from '@/src/types/auth';

export class AdminDashboardService {
  async getDashboardData(): Promise<AdminDashboardData> {
    const usersRef = collection(db, 'users');
    const auditRef = collection(db, 'adminAuditLogs');

    // 1. Métricas (KPIs) usando getCountFromServer para performance
    const [
      totalUsersSnap,
      pendingUsersSnap,
      activeUsersSnap,
      totalAdminsSnap
    ] = await Promise.all([
      getCountFromServer(usersRef),
      getCountFromServer(query(usersRef, where('status', '==', UserStatus.PENDING_APPROVAL))),
      getCountFromServer(query(usersRef, where('status', '==', UserStatus.ACTIVE))),
      getCountFromServer(query(usersRef, where('role', 'in', [UserRole.SUPER_ADMIN, UserRole.ORGANIZER])))
    ]);

    // Auditoria nas últimas 24h
    const yesterday = new Date();
    yesterday.setHours(yesterday.getHours() - 24);
    const audit24hSnap = await getCountFromServer(
      query(auditRef, where('timestamp', '>=', Timestamp.fromDate(yesterday)))
    );

    const metrics: AdminDashboardMetrics = {
      totalUsers: totalUsersSnap.data().count,
      pendingUsers: pendingUsersSnap.data().count,
      activeUsers: activeUsersSnap.data().count,
      totalAdmins: totalAdminsSnap.data().count,
      auditEventsLast24h: audit24hSnap.data().count
    };

    // 2. Prévia de Usuários Pendentes (Últimos 5)
    const qPending = query(
      usersRef,
      where('status', '==', UserStatus.PENDING_APPROVAL),
      orderBy('createdAt', 'desc'),
      limit(5)
    );
    const pendingDocs = await getDocs(qPending);
    const recentPendingUsers = pendingDocs.docs.map(d => ({ uid: d.id, ...d.data() } as UserProfile));

    // 3. Prévia de Auditoria (Últimas 10 ações)
    const qAudit = query(auditRef, orderBy('timestamp', 'desc'), limit(10));
    const auditDocs = await getDocs(qAudit);
    const recentAuditEvents = auditDocs.docs.map(d => ({ id: d.id, ...d.data() } as AuditEvent));

    return {
      metrics,
      recentPendingUsers,
      recentAuditEvents
    };
  }
}

export const adminDashboardService = new AdminDashboardService();
