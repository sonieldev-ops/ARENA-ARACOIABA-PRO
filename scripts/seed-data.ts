
import { cert, getApp, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
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

async function seed() {
  console.log("🚀 Iniciando seed de dados limpos...");

  // 1. Campeonato
  const champRef = adminDb.collection("campeonatos").doc("champ-2024");
  await champRef.set({
    name: "Copa Arena Pro 2024",
    status: "ACTIVE",
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp()
  });

  // 2. Times
  const teams = [
    { id: "team-01", name: "Leões do Norte", color: "#FF0000" },
    { id: "team-02", name: "Águias Reais", color: "#008000" },
    { id: "team-03", name: "Falcões de Ouro", color: "#FFD700" },
    { id: "team-04", name: "Tigres da Arena", color: "#FFA500" },
  ];

  for (const t of teams) {
    await adminDb.collection("times").doc(t.id).set({
      name: t.name,
      color: t.color,
      createdAt: FieldValue.serverTimestamp()
    });
  }

  // 3. Partidas (1 AO VIVO, 1 FINALIZADA, 2 AGENDADAS)
  const matches = [
    {
      id: "match-live-01",
      teamAId: "team-01",
      teamBId: "team-02",
      status: "LIVE",
      scoreA: 2,
      scoreB: 1,
      teamAName: "Leões do Norte",
      teamBName: "Águias Reais"
    },
    {
      id: "match-finished-01",
      teamAId: "team-03",
      teamBId: "team-04",
      status: "FINISHED",
      scoreA: 0,
      scoreB: 3,
      teamAName: "Falcões de Ouro",
      teamBName: "Tigres da Arena"
    },
    {
      id: "match-scheduled-01",
      teamAId: "team-01",
      teamBId: "team-03",
      status: "SCHEDULED",
      scoreA: 0,
      scoreB: 0,
      teamAName: "Leões do Norte",
      teamBName: "Falcões de Ouro"
    }
  ];

  for (const m of matches) {
    await adminDb.collection("partidas").doc(m.id).set({
      ...m,
      competitionId: "champ-2024",
      matchDate: new Date().toISOString(),
      createdAt: FieldValue.serverTimestamp()
    });
  }

  console.log("✅ Seed finalizado com sucesso! Dados limpos inseridos.");
}

seed().catch(console.error);
