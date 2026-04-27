import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/src/lib/firebase/admin";

export async function logAudit(input: {
  actorUserId: string;
  targetUserId?: string;
  action: "INVITE_ACCEPTED" | "INVITE_REJECTED" | "INVITE_EXPIRED";
  entityId: string; // inviteId
  before?: any;
  after?: any;
  reason?: string | null;
}) {
  await adminDb.collection("adminAuditLogs").add({
    ...input,
    entityType: "INVITE",
    source: "SYSTEM",
    createdAt: FieldValue.serverTimestamp(),
  });
}
