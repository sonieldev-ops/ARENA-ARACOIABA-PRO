import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  serverTimestamp,
  orderBy
} from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { UserProfile, UserStatus, UserRole } from '@/types/auth';

export class AdminUserService {
  /**
   * Lista todos os usuários aguardando aprovação
   */
  async getPendingUsers(): Promise<UserProfile[]> {
    const usersRef = collection(db, 'users');
    const q = query(
      usersRef,
      where('status', '==', UserStatus.PENDING_APPROVAL),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      ...doc.data(),
      uid: doc.id
    } as UserProfile));
  }

  /**
   * Aprova um usuário, definindo sua role final e status como ACTIVE
   */
  async approveUser(uid: string, role: UserRole, adminUid: string): Promise<void> {
    const userRef = doc(db, 'users', uid);

    await updateDoc(userRef, {
      status: UserStatus.ACTIVE,
      role: role,
      isApproved: true,
      lastApprovalAt: serverTimestamp(),
      lastApprovalBy: adminUid,
      updatedAt: serverTimestamp(),
      // Incrementa a versão de acesso para invalidar sessões antigas se necessário
      accessVersion: 2
    });
  }

  /**
   * Rejeita um usuário
   */
  async rejectUser(uid: string, reason: string, adminUid: string): Promise<void> {
    const userRef = doc(db, 'users', uid);

    await updateDoc(userRef, {
      status: UserStatus.REJECTED,
      blockedReason: reason,
      updatedAt: serverTimestamp(),
      lastApprovalBy: adminUid
    });
  }
}

export const adminUserService = new AdminUserService();
