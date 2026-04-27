import {
  collection,
  query,
  getDocs,
  where,
  orderBy,
  limit,
  Timestamp,
  DocumentData,
  QueryConstraint
} from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import {
  approveUserFn,
  rejectUserFn,
  changeUserAccessFn
} from '@/lib/firebase/functions';
import {
  UserAdminRow,
  ApproveUserPayload,
  RejectUserPayload,
  ChangeUserAccessPayload
} from '../types/user-admin.types';
import { UserStatus, UserRole } from '@/src/types/auth';

export class UsersAdminService {
  private static collectionName = 'users';

  static async listUsers(filters: {
    status?: UserStatus;
    role?: UserRole;
    isPending?: boolean;
    search?: string;
  } = {}): Promise<UserAdminRow[]> {
    const constraints: QueryConstraint[] = [];

    if (filters.status) {
      constraints.push(where('status', '==', filters.status));
    }

    if (filters.role) {
      constraints.push(where('role', '==', filters.role));
    }

    if (filters.isPending) {
      constraints.push(where('status', '==', UserStatus.PENDING_APPROVAL));
    }

    constraints.push(orderBy('createdAt', 'desc'));

    // O Firestore não suporta busca textual nativa tipo 'contains' de forma eficiente sem serviços externos (Algolia/Elastic)
    // Para um painel admin com volume moderado, podemos filtrar no client ou usar busca prefixada

    const q = query(collection(db, this.collectionName), ...constraints);
    const snapshot = await getDocs(q);

    let users = snapshot.docs.map(doc => ({
      uid: doc.id,
      ...doc.data()
    } as UserAdminRow));

    if (filters.search) {
      const s = filters.search.toLowerCase();
      users = users.filter(u =>
        u.fullName.toLowerCase().includes(s) ||
        u.email.toLowerCase().includes(s)
      );
    }

    return users;
  }

  static async approveUser(data: ApproveUserPayload) {
    const result = await approveUserFn(data);
    return result.data;
  }

  static async bulkApproveUsers(targetUserIds: string[]) {
    const res = await fetch('/api/admin/users/bulk-approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetUserIds }),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Falha na aprovação em lote');
    }
    return res.json();
  }

  static async rejectUser(data: RejectUserPayload) {
    const result = await rejectUserFn(data);
    return result.data;
  }

  static async changeUserAccess(data: ChangeUserAccessPayload) {
    const result = await changeUserAccessFn(data);
    return result.data;
  }
}
