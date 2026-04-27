import { NextRequest, NextResponse } from "next/server";
import { validateAdminSession } from "@/src/lib/auth/admin-guard";
import { adminDb } from "@/src/lib/firebase/admin";
import { removeUndefined, sanitizeData } from "@/src/lib/utils";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await validateAdminSession(request);
    const doc = await adminDb.collection("atletas").doc(params.id).get();
    if (!doc.exists) return NextResponse.json({ error: "Atleta não encontrado" }, { status: 404 });
    return NextResponse.json(sanitizeData({ id: doc.id, ...doc.data() }));
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await validateAdminSession(request);
    const body = await request.json();
    await adminDb.collection("atletas").doc(params.id).update(removeUndefined(body));
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}
