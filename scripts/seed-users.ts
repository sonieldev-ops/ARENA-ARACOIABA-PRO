import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Carregar variáveis de ambiente
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const serviceAccount = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount as any),
  });
}

const db = getFirestore();
const auth = getAuth();

async function seed() {
  const users = [
    {
      uid: 'admin-test-uid',
      email: 'admin@arena.com',
      password: 'AdminPassword123!',
      displayName: 'Admin Arena',
      role: 'SUPER_ADMIN',
      status: 'ACTIVE'
    },
    {
      uid: 'user-test-uid',
      email: 'atleta@arena.com',
      password: 'UserPassword123!',
      displayName: 'Atleta Teste',
      role: 'ATHLETE',
      status: 'ACTIVE'
    }
  ];

  for (const user of users) {
    try {
      // 1. Criar no Auth
      await auth.createUser({
        uid: user.uid,
        email: user.email,
        password: user.password,
        displayName: user.displayName,
      });

      // 2. Criar no Firestore
      await db.collection('usuarios').doc(user.uid).set({
        name: user.displayName,
        email: user.email,
        role: user.role,
        status: user.status,
        createdAt: new Date().toISOString()
      });

      console.log(`✅ Usuário ${user.role} criado: ${user.email}`);
    } catch (error: any) {
      if (error.code === 'auth/uid-already-exists' || error.code === 'auth/email-already-exists') {
        console.log(`ℹ️ Usuário ${user.email} já existe.`);
      } else {
        console.error(`❌ Erro ao criar ${user.email}:`, error.message);
      }
    }
  }
}

seed().then(() => process.exit());
