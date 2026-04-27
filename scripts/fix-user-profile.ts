
import { cert, getApp, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

function getPrivateKey(): string {
  let key = process.env.FIREBASE_ADMIN_PRIVATE_KEY || "";
  key = key.replace(/^["']|["']$/g, '');
  return key.replace(/\\n/g, "\n");
}

const adminApp = getApps().length > 0
  ? getApp()
  : initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey: getPrivateKey(),
      }),
    });

const adminDb = getFirestore(adminApp);

async function fixUser() {
  console.log("🔍 Buscando usuários para vincular ao novo campeonato...");

  const usersSnapshot = await adminDb.collection("usuarios").get();

  if (usersSnapshot.empty) {
    console.log("⚠️ Nenhum usuário encontrado para atualizar.");
    return;
  }

  const batch = adminDb.batch();

  usersSnapshot.docs.forEach(doc => {
    console.log(`Updating user: ${doc.id}`);
    batch.update(doc.ref, {
      teamId: "team-01", // Leões do Norte
      championshipId: "champ-2024",
      role: "ATHLETE",
      updatedAt: new Date()
    });
  });

  await batch.commit();
  console.log("✅ Usuários vinculados ao time 'Leões do Norte' e ao campeonato '2024'!");
}

fixUser().catch(console.error);
