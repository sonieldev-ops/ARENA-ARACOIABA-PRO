import { adminAuth, adminDb } from "@/src/lib/firebase/admin";
import { NextRequest } from "next/server";

export type AdminRole = 'SUPER_ADMIN' | 'ORGANIZER' | 'REFEREE' | 'STAFF';

export async function validateAdminSession(request: NextRequest, allowedRoles: AdminRole[] = ['SUPER_ADMIN', 'ORGANIZER', 'REFEREE', 'STAFF']) {
  const sessionCookie = request.cookies.get("__session")?.value;

  if (!sessionCookie) {
    throw new Error("Não autenticado");
  }

  try {
    const decodedToken = await adminAuth.verifySessionCookie(sessionCookie, true);

    // Buscar perfil do usuário no Firestore para verificar role
    const userDoc = await adminDb.collection("usuarios").doc(decodedToken.uid).get();
    const userData = userDoc.data();

    if (!userData || !allowedRoles.includes(userData.role)) {
      throw new Error("Acesso negado: Permissão insuficiente");
    }

    if (userData.status !== 'APPROVED') {
      throw new Error("Acesso negado: Conta pendente ou bloqueada");
    }

    return { user: userData, uid: decodedToken.uid };
  } catch (error) {
    console.error("Erro na validação admin:", error);
    throw error;
  }
}
