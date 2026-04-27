import { adminAuth, adminDb } from '../lib/firebase/admin';
import { UserRole, UserStatus } from '../src/types/auth';
import * as dotenv from 'dotenv';
import path from 'path';

// Carrega .env.local do root
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

async function setAdmin(email: string) {
  try {
    console.log(`Buscando usuário: ${email}`);
    const user = await adminAuth.getUserByEmail(email);
    const uid = user.uid;

    console.log(`Usuário encontrado: ${uid}. Atualizando para SUPER_ADMIN...`);

    // 1. Atualizar Custom Claims (Firebase Auth)
    await adminAuth.setCustomUserClaims(uid, {
      role: UserRole.SUPER_ADMIN,
      status: UserStatus.ACTIVE,
      isApproved: true,
      accessVersion: 1
    });

    // 2. Atualizar Perfil no Firestore
    await adminDb.collection('users').doc(uid).set({
      role: UserRole.SUPER_ADMIN,
      status: UserStatus.ACTIVE,
      isApproved: true,
      approvalRequired: false,
      accessVersion: 1,
      updatedAt: new Date(),
    }, { merge: true });

    console.log(`✅ Sucesso! sonieloficial@gmail.com agora é SUPER_ADMIN e está ATIVO.`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao definir admin:', error);
    process.exit(1);
  }
}

setAdmin('sonieloficial@gmail.com');
