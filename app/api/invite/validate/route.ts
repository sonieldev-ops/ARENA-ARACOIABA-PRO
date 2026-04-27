import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/src/lib/firebase/admin";
import { hashToken } from "@/src/lib/crypto/token";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.json({ valid: false, reason: "MISSING_TOKEN" }, { status: 400 });
  }

  const tokenHash = hashToken(token);

  // Busca o convite pelo hash do token
  const snap = await adminDb
    .collection("teamInvites")
    .where("tokenHash", "==", tokenHash)
    .limit(1)
    .get();

  if (snap.empty) {
    return NextResponse.json({ valid: false, reason: "NOT_FOUND" }, { status: 404 });
  }

  const doc = snap.docs[0];
  const data = doc.data();

  // 1. Verificar Expiração
  const now = Date.now();
  const expiresAtMillis = data.expiresAt?.toMillis?.() || 0;

  if (expiresAtMillis > 0 && expiresAtMillis < now) {
    await doc.ref.update({ status: "EXPIRED" });
    return NextResponse.json({ valid: false, reason: "EXPIRED" }, { status: 400 });
  }

  // 2. Verificar Status
  if (data.status !== "PENDING") {
    return NextResponse.json({ valid: false, reason: data.status }, { status: 400 });
  }

  return NextResponse.json({
    valid: true,
    inviteId: doc.id,
    email: data.invitedEmail,
    teamId: data.teamId,
    teamName: data.teamName,
    role: data.role
  });
}
