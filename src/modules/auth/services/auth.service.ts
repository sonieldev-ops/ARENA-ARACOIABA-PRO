import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth as clientAuth, db as clientDb } from '@/src/lib/firebase/client';
import { removeUndefined } from '@/src/lib/utils';
import { UserProfile, UserStatus, UserRole } from '@/src/types/auth';

export class AuthService {
  /**
   * Realiza o login no Firebase e cria a sessão no backend
   */
  async login(email: string, pass: string): Promise<UserProfile> {
    const userCredential = await signInWithEmailAndPassword(clientAuth, email, pass);
    const idToken = await userCredential.user.getIdToken();

    // Cria o cookie de sessão via API
    const sessionRes = await fetch('/api/auth/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    });

    if (!sessionRes.ok) {
      throw new Error('Falha ao criar sessão segura no servidor');
    }

    // Busca o perfil completo do usuário
    const meRes = await fetch('/api/auth/me');
    const { user } = await meRes.json();

    if (!user) {
      throw new Error('Perfil de usuário não encontrado');
    }

    return user as UserProfile;
  }

  /**
   * Realiza o cadastro de um novo usuário e entra em fluxo de aprovação
   */
  async register(data: { email: string; pass: string; fullName: string; phone?: string; requestedRole: UserRole }): Promise<UserProfile> {
    // 1. Criar no Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(clientAuth, data.email, data.pass);
    const uid = userCredential.user.uid;

    // 2. Criar Perfil no Firestore (Estado Inicial: PENDING_APPROVAL)
    const newUser: UserProfile = {
      uid,
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      role: UserRole.PUBLIC_USER, // Role base inicial
      status: UserStatus.PENDING_APPROVAL,
      isApproved: false,
      approvalRequired: true,
      accessVersion: 1,
      requestedRole: data.requestedRole,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      metadata: {
        appVersion: '1.0.0'
      }
    };

    await setDoc(doc(clientDb, 'usuarios', uid), removeUndefined(newUser));

    // 3. Criar sessão no backend
    const idToken = await userCredential.user.getIdToken();
    await fetch('/api/auth/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    });

    return newUser;
  }

  /**
   * Realiza o logout limpando Firebase e Cookies
   */
  async logout(): Promise<void> {
    await firebaseSignOut(clientAuth);
    await fetch('/api/auth/session', { method: 'DELETE' });
  }

  /**
   * Obtém o perfil atual baseado na sessão
   */
  async getCurrentUser(): Promise<UserProfile | null> {
    try {
      const res = await fetch('/api/auth/me');
      if (!res.ok) return null;
      const { user } = await res.json();
      return user || null;
    } catch {
      return null;
    }
  }

  /**
   * Traduz erros do Firebase para mensagens amigáveis
   */
  getFriendlyErrorMessage(error: any): string {
    const code = error?.code || '';
    switch (code) {
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'E-mail ou senha incorretos.';
      case 'auth/email-already-in-use':
        return 'Este e-mail já está em uso.';
      case 'auth/weak-password':
        return 'A senha deve ter pelo menos 6 caracteres.';
      case 'auth/user-disabled':
        return 'Esta conta foi desativada.';
      case 'auth/too-many-requests':
        return 'Muitas tentativas. Tente novamente mais tarde.';
      default:
        return 'Ocorreu um erro ao tentar entrar. Verifique seus dados.';
    }
  }
}

export const authService = new AuthService();
