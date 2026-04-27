
import { adminDb } from "../src/lib/firebase/admin";

async function clearDatabase() {
  console.log("🔥 Iniciando limpeza do banco de dados...");

  const collections = ["matches", "championships", "teams", "athletes", "rankings", "audit", "notifications"];

  for (const collectionName of collections) {
    console.log(`🧹 Limpando coleção: ${collectionName}...`);
    const snapshot = await adminDb.collection(collectionName).get();

    const batch = adminDb.batch();
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();
    console.log(`✅ Coleção ${collectionName} limpa.`);
  }

  console.log("✨ Banco de dados limpo com sucesso!");
}

clearDatabase().catch(console.error);
