
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

async function simulate() {
  const matchId = "match-live-02";
  console.log("🎮 Iniciando simulação de partida real...");

  // 1. Criar a Partida
  const matchRef = adminDb.collection("matches").doc(matchId);
  await matchRef.set({
    id: matchId,
    teamAId: "team-01", // Leões do Norte
    teamBId: "team-04", // Tigres da Arena
    teamAName: "Leões do Norte",
    teamBName: "Tigres da Arena",
    status: "LIVE",
    scoreA: 0,
    scoreB: 0,
    championshipId: "champ-2024",
    scheduledAt: FieldValue.serverTimestamp(),
    createdAt: FieldValue.serverTimestamp()
  });

  const eventsRef = matchRef.collection("events");

  // 2. Simular Cartão Amarelo
  console.log("🟨 Cartão Amarelo para Tigres...");
  await eventsRef.add({
    type: "YELLOW_CARD",
    playerName: "Gabriel Jesus",
    teamId: "team-04",
    minute: 12,
    createdAt: FieldValue.serverTimestamp()
  });

  // 3. Simular GOL (Isso ativa a animação no app!)
  console.log("⚽ GOL DOS LEÕES!");
  await matchRef.update({ scoreA: 1 });
  await eventsRef.add({
    type: "GOAL",
    playerName: "Ricardo Oliveira",
    teamId: "team-01",
    minute: 25,
    createdAt: FieldValue.serverTimestamp()
  });

  // 4. Simular Cartão Vermelho
  console.log("🟥 Cartão Vermelho!");
  await eventsRef.add({
    type: "RED_CARD",
    playerName: "Zagueiro Bruto",
    teamId: "team-04",
    minute: 40,
    createdAt: FieldValue.serverTimestamp()
  });

  console.log("✅ Simulação concluída! Olhe para o celular agora.");
}

simulate().catch(console.error);
