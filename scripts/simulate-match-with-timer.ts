
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
  const matchId = "match-timer-test";
  console.log("🕒 Iniciando partida com cronômetro...");

  // Definir início para 15 minutos atrás
  const startedAt = new Date();
  startedAt.setMinutes(startedAt.getMinutes() - 15);

  const matchRef = adminDb.collection("partidas").doc(matchId);
  await matchRef.set({
    id: matchId,
    teamAId: "team-01",
    teamBId: "team-02",
    teamAName: "Leões do Norte",
    teamBName: "Águias Reais",
    status: "LIVE",
    scoreA: 1,
    scoreB: 0,
    championshipId: "champ-2024",
    startedAt: Timestamp.fromDate(startedAt),
    updatedAt: FieldValue.serverTimestamp()
  });

  console.log("✅ Partida criada! O cronômetro no app deve mostrar '15''.");
}

simulate().catch(console.error);
