import { NextRequest, NextResponse } from "next/server";
import { validateAdminSession } from "@/src/lib/auth/admin-guard";
import { adminDb } from "@/src/lib/firebase/admin";
import { updateRankingAfterMatch } from "@/src/modules/admin/services/ranking-admin.service";
import { Transaction } from "firebase-admin/firestore";

export async function POST(request: NextRequest) {
  try {
    await validateAdminSession(request);
    const { championshipId } = await request.json();

    if (!championshipId) return NextResponse.json({ error: "ID obrigatório" }, { status: 400 });

    // Buscar todas as partidas finalizadas do campeonato
    const matchesSnapshot = await adminDb.collection("partidas")
      .where("competitionId", "==", championshipId)
      .where("status", "==", "FINISHED")
      .get();

    // Resetar ranking atual antes de recalcular
    const rankingSnapshot = await adminDb.collection("campeonatos")
      .doc(championshipId)
      .collection("ranking")
      .get();

    const batch = adminDb.batch();
    rankingSnapshot.docs.forEach((doc: any) => batch.delete(doc.ref));
    await batch.commit();

    // Recalcular para cada partida
    for (const matchDoc of matchesSnapshot.docs) {
      await adminDb.runTransaction(async (transaction: Transaction) => {
        await updateRankingAfterMatch(matchDoc.id, transaction);
      });
    }

    return NextResponse.json({ success: true, recalculated: matchesSnapshot.size });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
