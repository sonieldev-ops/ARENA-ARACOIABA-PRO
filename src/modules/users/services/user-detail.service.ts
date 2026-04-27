import {
  doc,
  getDoc,
  collection,
  query,
  where,
  orderBy,
  getDocs,
  limit
} from 'firebase/firestore';
import { db } from '@/src/lib/firebase/client';
import { UserProfile } from '@/src/types/auth';
import { AdminAuditLog } from '../types/user-detail.types';
import { QueryConstraint } from 'firebase/firestore';

export class UserDetailService {
  static async getUserById(uid: string): Promise<UserProfile | null> {
    const docRef = doc(db, 'usuarios', uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { uid: docSnap.id, ...docSnap.data() } as UserProfile;
    }
    return null;
  }

  static async getUserAuditLogs(uid: string, filters?: any): Promise<AdminAuditLog[]> {
    const logsRef = collection(db, 'logs_auditoria');
    const constraints: QueryConstraint[] = [
      where('targetUserId', '==', uid),
      orderBy('createdAt', 'desc')
    ];

    if (filters?.limit) {
      constraints.push(limit(filters.limit));
    }

    const q = query(logsRef, ...constraints);
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as AdminAuditLog));
  }
}
