import { NextRequest, NextResponse } from "next/server";
import { validateAdminSession } from "@/src/lib/auth/admin-guard";
import { adminDb } from "@/src/lib/firebase/admin";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await validateAdminSession(request);
    const doc = await adminDb.collection("matches").doc(params.id).get();
    if (!doc.exists) return NextResponse.json({ error: "Partida não encontrada" }, { status: 404 });
    return NextResponse.json({ id: doc.id, ...doc.data() });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}
