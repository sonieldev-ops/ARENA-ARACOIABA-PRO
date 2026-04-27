import { NextRequest, NextResponse } from "next/server";
import { validateAdminSession } from "@/src/lib/auth/admin-guard";
import { adminDb } from "@/src/lib/firebase/admin";
import { sanitizeData } from "@/src/lib/utils";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await validateAdminSession(request);
    const doc = await adminDb.collection("partidas").doc(params.id).get();
    if (!doc.exists) return NextResponse.json({ error: "Partida não encontrada" }, { status: 404 });
    return NextResponse.json(sanitizeData({ id: doc.id, ...doc.data() }));
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}
