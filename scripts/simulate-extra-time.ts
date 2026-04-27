
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

async function simulate() {
  const matchId = "match-extra-time";
  console.log("🕒 Simulando acréscimos do 1º tempo...");

  // Definir início para 48 minutos atrás
  const startedAt = new Date();
  startedAt.setMinutes(startedAt.getMinutes() - 48);

  const matchRef = adminDb.collection("partidas").doc(matchId);
  await matchRef.set({
    id: matchId,
    teamAId: "team-01",
    teamBId: "team-03",
    teamAName: "Leões do Norte",
    teamBName: "Falcões",
    status: "LIVE",
    period: "1T", // 1º Tempo
    scoreA: 0,
    scoreB: 0,
    championshipId: "champ-2024",
    startedAt: Timestamp.fromDate(startedAt),
    updatedAt: FieldValue.serverTimestamp()
  });

  console.log("✅ Partida criada! No app deve aparecer: 1º TEMPO e 45+3'.");
}

simulate().catch(console.error);
