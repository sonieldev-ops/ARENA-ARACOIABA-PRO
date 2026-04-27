import { NextRequest, NextResponse } from "next/server";
import { validateAdminSession } from "@/src/lib/auth/admin-guard";
import { adminDb } from "@/src/lib/firebase/admin";
import { sanitizeData } from "@/src/lib/utils";

export async function GET(request: NextRequest) {
  try {
    await validateAdminSession(request);
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");

    const snapshot = await adminDb.collection("logs_auditoria")
      .orderBy("createdAt", "desc")
      .limit(limit)
      .get();

    const data = snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json(sanitizeData(data));
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}
