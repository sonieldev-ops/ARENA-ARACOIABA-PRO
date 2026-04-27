
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as dotenv from 'dotenv';
import { join } from 'path';
import fs from 'fs';

dotenv.config({ path: join(process.cwd(), '.env.local') });

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n').replace(/^["']|["']$/g, ''),
    }),
  });
}

const db = getFirestore();
const collections = ['championships', 'teams', 'athletes', 'matches', 'users', 'adminAuditLogs', 'rankings', 'scorers'];

async function exportAll() {
  console.log("📦 Iniciando Backup do Firestore...");
  const backup = {};

  for (const col of collections) {
    console.log(`- Exportando: ${col}`);
    const snap = await db.collection(col).get();
    backup[col] = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  }

  const fileName = `backup-firestore-${new Date().toISOString().split('T')[0]}.json`;
  fs.writeFileSync(fileName, JSON.stringify(backup, null, 2));
  console.log(`✅ Backup concluído com sucesso: ${fileName}`);
}

exportAll().catch(console.error);
