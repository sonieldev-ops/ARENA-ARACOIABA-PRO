import { NextRequest, NextResponse } from "next/server";
import { adminDb, adminAuth } from "@/src/lib/firebase/admin";
import { generateToken, hashToken } from "@/src/lib/crypto/token";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(req: NextRequest) {
  try {
    const { email, teamId } = await req.json();

    if (!email || !teamId) {
      return NextResponse.json({ error: "E-mail e ID do time são obrigatórios" }, { status: 400 });
    }

    // 1. Verificar autenticação e permissão
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const idToken = authHeader.split("Bearer ")[1];
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const actorUid = decodedToken.uid;

    // Buscar dados do ator (quem está convidando)
    const actorDoc = await adminDb.collection("usuarios").doc(actorUid).get();
    const actorData = actorDoc.data();

    // Regra: Apenas Managers do time ou Super Admins podem convidar
    const isManager = actorData?.role === "TEAM_MANAGER" && actorData?.teamId === teamId;
    const isSuperAdmin = actorData?.role === "SUPER_ADMIN";

    if (!isManager && !isSuperAdmin) {
      return NextResponse.json({ error: "Sem permissão para convidar atletas para este time" }, { status: 403 });
    }

    // 2. Verificar se já existe um convite pendente para este e-mail neste time
    const existingInvites = await adminDb
      .collection("teamInvites")
      .where("invitedEmail", "==", email)
      .where("teamId", "==", teamId)
      .where("status", "==", "PENDING")
      .limit(1)
      .get();

    if (!existingInvites.empty) {
      return NextResponse.json({ error: "Já existe um convite pendente para este atleta" }, { status: 400 });
    }

    // 3. Gerar Token e Hash
    const token = generateToken();
    const tokenHash = hashToken(token);

    // 4. Criar Convite no Firestore
    const inviteRef = adminDb.collection("teamInvites").doc();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Expira em 7 dias

    const inviteData = {
      invitedEmail: email.toLowerCase(),
      teamId,
      teamName: actorData?.teamName || "Time Oficial",
      invitedBy: actorUid,
      invitedByName: actorData?.fullName || "Gestor",
      status: "PENDING",
      tokenHash,
      role: "ATHLETE",
      createdAt: FieldValue.serverTimestamp(),
      expiresAt: FieldValue.serverTimestamp(), // Usando placeholder para exemplo, mas o ideal é Timestamp.fromDate(expiresAt)
    };

    // Ajuste para Timestamp real de expiração
    await inviteRef.set({
      ...inviteData,
      expiresAt: expiresAt
    });

    // 5. Gerar Link de Convite
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const inviteLink = `${appUrl}/invite/accept?id=${inviteRef.id}&token=${token}`;

    // 6. Enviar E-mail (Resend)
    let emailSent = false;
    try {
      const { sendInviteEmail } = await import("@/src/modules/invite/email/invite-email");
      await sendInviteEmail({
        to: email,
        teamName: actorData?.teamName || "Time Oficial",
        inviteLink,
        invitedByName: actorData?.fullName || "Um Gestor"
      });
      emailSent = true;
    } catch (emailError) {
      console.error("Falha ao enviar e-mail:", emailError);
      // Não bloqueamos o sucesso da API se apenas o e-mail falhar
    }

    // 7. Log de Auditoria
    await adminDb.collection("logs_auditoria").add({
      action: "INVITE_CREATED",
      operatorName: actorData?.fullName,
      operatorUid: actorUid,
      targetName: email,
      targetUid: inviteRef.id,
      timestamp: FieldValue.serverTimestamp(),
      severity: "INFO",
      details: `Convite enviado para ${email}. E-mail enviado: ${emailSent ? 'SIM' : 'FALHA'}`
    });

    return NextResponse.json({
      success: true,
      inviteId: inviteRef.id,
      inviteLink,
      emailSent
    });

  } catch (error: any) {
    console.error("Invite Creation Error:", error);
    return NextResponse.json({ error: error.message || "Erro interno ao criar convite" }, { status: 500 });
  }
}
