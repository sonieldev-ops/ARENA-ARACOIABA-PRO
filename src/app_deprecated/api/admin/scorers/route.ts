import { NextRequest, NextResponse } from "next/server";
import { validateAdminSession } from "@/src/lib/auth/admin-guard";
import { adminDb } from "@/src/lib/firebase/admin";
import { sanitizeData } from "@/src/lib/utils";

export async function GET(request: NextRequest) {
  try {
    await validateAdminSession(request);
    const { searchParams } = new URL(request.url);
    const championshipId = searchParams.get("championshipId");

    if (!championshipId) {
      return NextResponse.json({ error: "ID do campeonato obrigatório" }, { status: 400 });
    }

    const snapshot = await adminDb.collection("campeonatos")
      .doc(championshipId)
      .collection("artilheiros")
      .orderBy("goals", "desc")
      .get();

    const data = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json(sanitizeData(data));
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}
