import * as admin from 'firebase-admin';
import { cert, getApp, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import * as dotenv from 'dotenv';
import * as path from 'path';

// Carregar variáveis de ambiente do .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value || !value.trim()) {
    throw new Error(`Missing ${name} in .env.local`);
  }
  return value;
}

function getPrivateKey(): string {
  const key = getRequiredEnv("FIREBASE_ADMIN_PRIVATE_KEY");
  return key.replace(/\\n/g, "\n").replace(/^["']|["']$/g, '');
}

// Inicializar Admin
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: getRequiredEnv("FIREBASE_ADMIN_PROJECT_ID"),
      clientEmail: getRequiredEnv("FIREBASE_ADMIN_CLIENT_EMAIL"),
      privateKey: getPrivateKey(),
    }),
  });
}

const auth = getAuth();
const db = getFirestore();

// CONFIGURAÇÃO DO SUPER ADMIN - ALTERE AQUI
const ADMIN_CONFIG = {
  email: 'admin@arenaaracoiaba.pro', // ALTERE PARA SEU EMAIL
  password: 'MudarSenha123!',         // ALTERE PARA UMA SENHA FORTE
  fullName: 'Super Administrador',
};

async function bootstrap() {
  console.log('🚀 Iniciando bootstrap do Super Admin...');

  try {
    let userRecord: admin.auth.UserRecord;

    try {
      // 1. Verificar se usuário já existe no Auth
      userRecord = await auth.getUserByEmail(ADMIN_CONFIG.email);
      console.log(`ℹ️ Usuário ${ADMIN_CONFIG.email} já existe. Promovendo...`);
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        // 2. Criar novo usuário no Auth
        userRecord = await auth.createUser({
          email: ADMIN_CONFIG.email,
          password: ADMIN_CONFIG.password,
          displayName: ADMIN_CONFIG.fullName,
          emailVerified: true,
        });
        console.log(`✅ Novo usuário criado: ${userRecord.uid}`);
      } else {
        throw error;
      }
    }

    const uid = userRecord.uid;

    // 3. Definir Custom Claims
    const claims = {
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
      isApproved: true,
      approvalRequired: false,
    };

    await auth.setCustomUserClaims(uid, claims);
    console.log('✅ Custom Claims definidas (SUPER_ADMIN).');

    // 4. Criar/Atualizar documento no Firestore
    const userRef = db.collection('users').doc(uid);
    const now = FieldValue.serverTimestamp();

    await userRef.set({
      uid,
      email: ADMIN_CONFIG.email,
      fullName: ADMIN_CONFIG.fullName,
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
      isApproved: true,
      approvalRequired: false,
      accessVersion: 1,
      createdAt: now,
      updatedAt: now,
      createdBy: 'bootstrap-script',
      lastRoleChangeAt: now,
      lastRoleChangeBy: 'bootstrap-script',
      lastApprovalAt: now,
      lastApprovalBy: 'bootstrap-script',
      metadata: {
        appVersion: '1.0.0',
        bootstrapped: true
      }
    }, { merge: true });

    console.log('✅ Documento no Firestore atualizado.');

    // 5. Revogar Refresh Tokens (forçar nova sessão)
    await auth.revokeRefreshTokens(uid);
    console.log('✅ Refresh tokens revogados. O usuário precisará fazer login novamente.');

    console.log('\n✨ BOOTSTRAP CONCLUÍDO COM SUCESSO! ✨');
    console.log('--------------------------------------------------');
    console.log(`Email: ${ADMIN_CONFIG.email}`);
    console.log(`Senha: ${ADMIN_CONFIG.password}`);
    console.log('--------------------------------------------------');
    console.log('⚠️ IMPORTANTE: Delete este script após o primeiro uso!');

  } catch (error) {
    console.error('❌ ERRO NO BOOTSTRAP:', error);
    process.exit(1);
  }
}

bootstrap();
