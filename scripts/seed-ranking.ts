
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

async function seedRanking() {
  const championshipId = "champ-2024";
  console.log(`🏆 Gerando ranking e artilharia para o campeonato: ${championshipId}`);

  const rankingRef = adminDb.collection("classificacoes").doc(championshipId).collection("times");

  const teamsData = [
    { teamId: "team-01", teamName: "Leões do Norte", points: 12, games: 5, wins: 4, draws: 0, losses: 1, goalsFor: 10, goalsAgainst: 3, goalDifference: 7, position: 1 },
    { teamId: "team-04", teamName: "Tigres da Arena", points: 10, games: 5, wins: 3, draws: 1, losses: 1, goalsFor: 8, goalsAgainst: 4, goalDifference: 4, position: 2 },
    { teamId: "team-02", teamName: "Águias Reais", points: 7, games: 5, wins: 2, draws: 1, losses: 2, goalsFor: 6, goalsAgainst: 6, goalDifference: 0, position: 3 },
    { teamId: "team-03", teamName: "Falcões de Ouro", points: 3, games: 5, wins: 1, draws: 0, losses: 4, goalsFor: 4, goalsAgainst: 12, goalDifference: -8, position: 4 },
  ];

  console.log("📊 Inserindo classificação...");
  for (const team of teamsData) {
    await rankingRef.doc(team.teamId).set(team);
  }

  const scorersRef = adminDb.collection("classificacoes").doc(championshipId).collection("artilheiros");

  const scorersData = [
    { id: "scorer-01", playerName: "Ricardo Oliveira", teamName: "Leões do Norte", goals: 6, teamId: "team-01" },
    { id: "scorer-02", playerName: "Gabriel Jesus", teamName: "Tigres da Arena", goals: 4, teamId: "team-04" },
    { id: "scorer-03", playerName: "Marcos Paulo", teamName: "Águias Reais", goals: 3, teamId: "team-02" },
    { id: "scorer-04", playerName: "Lucas Silva", teamName: "Leões do Norte", goals: 2, teamId: "team-01" },
  ];

  console.log("⚽ Inserindo artilheiros...");
  for (const scorer of scorersData) {
    await scorersRef.doc(scorer.id).set(scorer);
  }

  console.log("✅ Dados de ranking e artilharia inseridos com sucesso!");
}

seedRanking().catch(console.error);
