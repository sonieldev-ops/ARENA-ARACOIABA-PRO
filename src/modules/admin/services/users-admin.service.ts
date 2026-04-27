import { adminDb, adminAuth } from "@/src/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { logAudit } from "./audit.service";

export class UsersAdminService {
  async list(filters: { role?: string; status?: string } = {}) {
    let query: any = adminDb.collection("users");

    if (filters.role) query = query.where("role", "==", filters.role);
    if (filters.status) query = query.where("status", "==", filters.status);

    const snapshot = await query.orderBy("createdAt", "desc").get();
    return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
  }

  async updateUserRole(userId: string, role: string, operatorId: string) {
    await adminDb.collection("users").doc(userId).update({
      role,
      updatedAt: FieldValue.serverTimestamp()
    });

    // Update Custom Claims
    await adminAuth.setCustomUserClaims(userId, { role });

    await logAudit({
      action: "UPDATE_USER_ROLE",
      operator: operatorId,
      target: userId,
      details: `Novo papel: ${role}`
    });

    return { success: true };
  }

  async updateUserStatus(userId: string, status: string, operatorId: string, reason?: string) {
    await adminDb.collection("users").doc(userId).update({
      status,
      updatedAt: FieldValue.serverTimestamp()
    });

    await logAudit({
      action: "UPDATE_USER_STATUS",
      operator: operatorId,
      target: userId,
      details: `Novo status: ${status}`,
      reason
    });

    return { success: true };
  }

  async getPendingApprovals() {
    const snapshot = await adminDb.collection("users")
      .where("status", "==", "PENDING_APPROVAL")
      .get();
    return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
  }
}

export const usersAdminService = new UsersAdminService();
