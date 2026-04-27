
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

async function addGoal(matchId: string, team: 'A' | 'B') {
  console.log(`⚽ Registrando novo GOL para o Time ${team}...`);

  const matchRef = adminDb.collection("matches").doc(matchId);
  const matchDoc = await matchRef.get();

  if (!matchDoc.exists) {
    console.error("❌ Partida não encontrada.");
    return;
  }

  const matchData = matchDoc.data();
  const currentScoreA = matchData?.scoreA || 0;
  const currentScoreB = matchData?.scoreB || 0;

  const newScoreA = team === 'A' ? currentScoreA + 1 : currentScoreA;
  const newScoreB = team === 'B' ? currentScoreB + 1 : currentScoreB;

  // Atualizar Placar
  await matchRef.update({
    scoreA: newScoreA,
    scoreB: newScoreB,
    updatedAt: FieldValue.serverTimestamp()
  });

  // Adicionar Evento de Gol
  await matchRef.collection("events").add({
    type: "GOAL",
    playerName: team === 'A' ? "Ricardo Oliveira" : "Gabriel Jesus",
    teamId: team === 'A' ? matchData?.teamAId : matchData?.teamBId,
    minute: 65,
    createdAt: FieldValue.serverTimestamp()
  });

  console.log(`✅ GOOOOL! Placar atualizado: ${newScoreA} x ${newScoreB}`);
}

// Adiciona o segundo gol para os Leões (Time A)
addGoal("match-live-02", 'A').catch(console.error);
