
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: '.env.local' });

const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');

const serviceAccount = {
  projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
  clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
  privateKey: privateKey,
};

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount as any),
  });
}

const db = getFirestore();

async function resetMatches() {
  console.log('--- Iniciando Reset de Partidas ---');
  
  const matchesSnapshot = await db.collection('partidas').get();
  
  if (matchesSnapshot.empty) {
    console.log('Nenhuma partida encontrada.');
    return;
  }

  const batch = db.batch();
  
  matchesSnapshot.docs.forEach((doc) => {
    console.log(`Finalizando partida: ${doc.id}`);
    batch.update(doc.ref, {
      status: 'FINISHED',
      scoreA: 0,
      scoreB: 0,
      actualStartTime: null,
      actualEndTime: null,
      updatedAt: new Date()
    });
  });

  await batch.commit();
  console.log('--- Todas as partidas foram resetadas para FINISHED com placar 0-0 ---');
}

resetMatches().catch(console.error);
