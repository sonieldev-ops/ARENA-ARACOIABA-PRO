
import { cert, getApp, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue, Timestamp } from "firebase-admin/firestore";
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

async function resetAndStart() {
  console.log("🧹 Finalizando todas as partidas ao vivo...");

  // 1. Buscar todas as partidas LIVE
  const liveMatches = await adminDb.collection("matches").where("status", "==", "LIVE").get();

  const batch = adminDb.batch();
  liveMatches.forEach(doc => {
    batch.update(doc.ref, {
        status: "FINISHED",
        updatedAt: FieldValue.serverTimestamp()
    });
  });

  await batch.commit();
  console.log(`✅ ${liveMatches.size} partidas finalizadas.`);

  // 2. Criar a nova partida
  const matchId = "match-new-live-" + Date.now();
  console.log(`🚀 Iniciando nova partida: ${matchId}...`);

  const matchRef = adminDb.collection("matches").doc(matchId);
  await matchRef.set({
    id: matchId,
    teamAId: "team-01", // Leões do Norte
    teamBId: "team-05", // Guerreiros de Araçoiaba (Novo oponente)
    teamAName: "Leões do Norte",
    teamBName: "Guerreiros",
    status: "LIVE",
    period: "1T",
    scoreA: 0,
    scoreB: 0,
    championshipId: "champ-2024",
    startedAt: FieldValue.serverTimestamp(),
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp()
  });

  console.log("✨ Tudo pronto! A nova partida já deve estar no seu celular (0' - 1º TEMPO).");
}

resetAndStart().catch(console.error);
