import { adminDb } from "@/src/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { removeUndefined } from "@/src/lib/utils";

export async function logAudit(data: {
  action: string;
  operator: string;
  target: string;
  details?: string;
  reason?: string;
}) {
  try {
    if (!adminDb) return;
    await adminDb.collection("logs_auditoria").add(removeUndefined({
      ...data,
      createdAt: FieldValue.serverTimestamp(),
    }));
  } catch (error) {
    console.error("Erro ao registrar log de auditoria:", error);
  }
}
