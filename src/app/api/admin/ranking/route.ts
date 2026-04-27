import { NextRequest, NextResponse } from "next/server";
import { validateAdminSession } from "@/src/lib/auth/admin-guard";
import { adminDb } from "@/src/lib/firebase/admin";

export async function GET(request: NextRequest) {
  try {
    await validateAdminSession(request);
    const { searchParams } = new URL(request.url);
    const championshipId = searchParams.get("championshipId");

    if (!championshipId) {
      return NextResponse.json({ error: "ID do campeonato obrigatório" }, { status: 400 });
    }

    const snapshot = await adminDb.collection("championships")
      .doc(championshipId)
      .collection("ranking")
      .orderBy("points", "desc")
      .orderBy("goalDifference", "desc")
      .orderBy("goalsFor", "desc")
      .get();

    const data = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}
