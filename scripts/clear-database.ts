
import { cert, getApp, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import * as dotenv from "dotenv";
import * as path from "path";

// Carregar .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

function getPrivateKey(): string {
  let key = process.env.FIREBASE_ADMIN_PRIVATE_KEY || "";
  key = key.replace(/^["']|["']$/g, '');
  return key.replace(/\\n/g, "\n");
}

const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
const privateKey = getPrivateKey();

const adminApp = getApps().length > 0
  ? getApp()
  : initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });

const adminDb = getFirestore(adminApp);

async function clearDatabase() {
  console.log("🔥 Iniciando limpeza do banco de dados...");

  const collections = ["matches", "championships", "teams", "athletes", "rankings", "audit", "notifications"];

  for (const collectionName of collections) {
    console.log(`🧹 Limpando coleção: ${collectionName}...`);
    const snapshot = await adminDb.collection(collectionName).get();

    if (snapshot.empty) {
      console.log(`ℹ️ Coleção ${collectionName} já está vazia.`);
      continue;
    }

    const batch = adminDb.batch();
    snapshot.docs.forEach((doc: any) => {
      batch.delete(doc.ref);
    });

    await batch.commit();
    console.log(`✅ Coleção ${collectionName} limpa.`);
  }

  console.log("✨ Banco de dados limpo com sucesso!");
}

clearDatabase().catch(console.error);
