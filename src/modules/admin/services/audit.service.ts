import { adminDb } from "@/src/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

export async function logAudit(data: {
  action: string;
  operator: string;
  target: string;
  details?: string;
  reason?: string;
}) {
  try {
    if (!adminDb) return;
    await adminDb.collection("adminAuditLogs").add({
      ...data,
      createdAt: FieldValue.serverTimestamp(),
    });
  } catch (error) {
    console.error("Erro ao registrar log de auditoria:", error);
  }
}
