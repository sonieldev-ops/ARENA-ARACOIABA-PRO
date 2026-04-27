import { NextRequest, NextResponse } from "next/server";
import { validateAdminSession } from "@/src/lib/auth/admin-guard";
import { adminDb } from "@/src/lib/firebase/admin";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await validateAdminSession(request);
    const doc = await adminDb.collection("teams").doc(params.id).get();
    if (!doc.exists) return NextResponse.json({ error: "Time não encontrado" }, { status: 404 });
    return NextResponse.json({ id: doc.id, ...doc.data() });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await validateAdminSession(request);
    const body = await request.json();
    await adminDb.collection("teams").doc(params.id).update(body);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}
