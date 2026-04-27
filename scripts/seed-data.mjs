
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import * as dotenv from 'dotenv';
import { join } from 'path';

dotenv.config({ path: join(process.cwd(), '.env.local') });

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n').replace(/^["']|["']$/g, ''),
    }),
  });
}

const db = getFirestore();

async function seed() {
  console.log("🚀 Starting seed...");

  // 1. Championship
  const champRef = db.collection("championships").doc("champ-test-01");
  await champRef.set({
    name: "Copa Arena Pro 2024",
    status: "ACTIVE",
    season: "2024",
    city: "Araçoiaba",
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp()
  });

  // 2. Teams (6+)
  const teams = [
    { id: "team-01", name: "Flamengo", color: "#FF0000", city: "Rio", status: "ACTIVE" },
    { id: "team-02", name: "Palmeiras", color: "#008000", city: "SP", status: "ACTIVE" },
    { id: "team-03", name: "São Paulo", color: "#FFFFFF", city: "SP", status: "ACTIVE" },
    { id: "team-04", name: "Corinthians", color: "#000000", city: "SP", status: "ACTIVE" },
    { id: "team-05", name: "Santos", color: "#FFFFFF", city: "Santos", status: "ACTIVE" },
    { id: "team-06", name: "Gremio", color: "#0000FF", city: "POA", status: "ACTIVE" },
  ];

  for (const t of teams) {
    await db.collection("teams").doc(t.id).set({
      ...t,
      championshipId: "champ-test-01",
      championshipName: "Copa Arena Pro 2024",
      createdAt: FieldValue.serverTimestamp()
    });
  }

  // 3. Athletes (24)
  for (let i = 1; i <= 24; i++) {
    const team = teams[(i % 6)];
    await db.collection("athletes").doc(`athlete-${i}`).set({
      name: `Atleta ${i}`,
      teamId: team.id,
      teamName: team.name,
      number: String(i),
      position: "FW",
      status: "ACTIVE",
      goals: 0,
      createdAt: FieldValue.serverTimestamp()
    });
  }

  // 4. Matches (10 total: 1 LIVE, 2 FINISHED, 7 SCHEDULED)
  const matches = [
    { id: "match-live", teamAId: "team-01", teamBId: "team-02", status: "LIVE", scoreA: 1, scoreB: 1 },
    { id: "match-fin-1", teamAId: "team-03", teamBId: "team-04", status: "FINISHED", scoreA: 2, scoreB: 0 },
    { id: "match-fin-2", teamAId: "team-05", teamBId: "team-06", status: "FINISHED", scoreA: 1, scoreB: 1 },
  ];

  for (let i = 1; i <= 7; i++) {
    matches.push({
      id: `match-planned-${i}`,
      teamAId: teams[i % 6].id,
      teamBId: teams[(i + 1) % 6].id,
      status: "SCHEDULED",
      scoreA: 0,
      scoreB: 0
    });
  }

  for (const m of matches) {
    const teamA = teams.find(t => t.id === m.teamAId);
    const teamB = teams.find(t => t.id === m.teamBId);
    await db.collection("matches").doc(m.id).set({
      ...m,
      competitionId: "champ-test-01",
      teamAName: teamA?.name,
      teamBName: teamB?.name,
      date: FieldValue.serverTimestamp(),
      location: "Arena Central",
      createdAt: FieldValue.serverTimestamp()
    });
  }

  console.log("✅ Seed finished successfully!");
}

seed().catch(console.error);
