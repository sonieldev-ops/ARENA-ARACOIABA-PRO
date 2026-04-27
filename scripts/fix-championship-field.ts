
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

async function fixField() {
  console.log("🔧 Corrigindo campo competitionId -> championshipId nas partidas...");

  const matchesSnapshot = await adminDb.collection("partidas").get();
  const batch = adminDb.batch();

  matchesSnapshot.docs.forEach(doc => {
    const data = doc.data();
    if (data.competitionId) {
      batch.update(doc.ref, {
        championshipId: data.competitionId,
        // competitionId: adminDb.terminate() // Opcional: remover campo antigo
      });
      console.log(`Partida ${doc.id} atualizada.`);
    }
  });

  // Também garantir que o campeonato tenha status ACTIVE
  batch.update(adminDb.collection("campeonatos").doc("champ-2024"), {
    status: "ACTIVE"
  });

  await batch.commit();
  console.log("✅ Campos corrigidos e campeonato ativado!");
}

fixField().catch(console.error);
