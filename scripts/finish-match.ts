
import { cert, getApp, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
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

async function finishMatch(matchId: string) {
  console.log(`🏁 Finalizando partida: ${matchId}...`);

  const matchRef = adminDb.collection("matches").doc(matchId);
  const matchDoc = await matchRef.get();

  if (!matchDoc.exists) {
    console.error("❌ Partida não encontrada.");
    return;
  }

  const matchData = matchDoc.data();
  if (matchData?.status === "FINISHED") {
    console.log("⚠️ Esta partida já está finalizada.");
    return;
  }

  // 1. Atualizar status da partida
  await matchRef.update({
    status: "FINISHED",
    updatedAt: FieldValue.serverTimestamp()
  });

  console.log(`✅ Partida ${matchId} finalizada com placar: ${matchData?.scoreA} x ${matchData?.scoreB}`);

  // 2. Opcional: Aqui poderíamos disparar a lógica de atualização de ranking
  // Mas como já temos um script de seed de ranking, os dados estão lá.
}

// Finaliza a partida de teste
finishMatch("match-live-01").catch(console.error);
