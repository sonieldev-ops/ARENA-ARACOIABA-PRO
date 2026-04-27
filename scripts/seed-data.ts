
import { adminDb } from "../src/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

async function seed() {
  console.log("Starting seed...");

  // 1. Championship
  const champRef = adminDb.collection("championships").doc("champ-test-01");
  await champRef.set({
    name: "Copa Arena Pro 2024",
    status: "ACTIVE",
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp()
  });

  // 2. Teams (6+)
  const teams = [
    { id: "team-01", name: "Flamengo", color: "#FF0000" },
    { id: "team-02", name: "Palmeiras", color: "#008000" },
    { id: "team-03", name: "São Paulo", color: "#FFFFFF" },
    { id: "team-04", name: "Corinthians", color: "#000000" },
    { id: "team-05", name: "Santos", color: "#FFFFFF" },
    { id: "team-06", name: "Gremio", color: "#0000FF" },
  ];

  for (const t of teams) {
    await adminDb.collection("teams").doc(t.id).set({
      ...t,
      createdAt: FieldValue.serverTimestamp()
    });
  }

  // 3. Athletes (20+)
  for (let i = 1; i <= 24; i++) {
    const teamId = teams[(i % 6)].id;
    await adminDb.collection("athletes").doc(`athlete-${i}`).set({
      name: `Atleta ${i}`,
      teamId: teamId,
      number: i,
      position: "FW",
      goals: 0,
      createdAt: FieldValue.serverTimestamp()
    });
  }

  // 4. Matches (10 total: 1 LIVE, 2 FINISHED, 7 PLANNED)
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
      status: "PLANNED",
      scoreA: 0,
      scoreB: 0
    });
  }

  for (const m of matches) {
    await adminDb.collection("matches").doc(m.id).set({
      ...m,
      competitionId: "champ-test-01",
      teamAName: teams.find(t => t.id === m.teamAId)?.name,
      teamBName: teams.find(t => t.id === m.teamBId)?.name,
      matchDate: new Date().toISOString(),
      createdAt: FieldValue.serverTimestamp()
    });
  }

  console.log("Seed finished successfully!");
}

seed().catch(console.error);
