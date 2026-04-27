import { adminDb } from "@/src/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { removeUndefined } from "@/src/lib/utils";

export interface CreateTeamInput {
  name: string;
  championshipId: string;
  championshipName: string;
  city: string;
  status: 'ACTIVE' | 'INACTIVE' | 'BLOCKED';
}

export class TeamAdminService {
  async create(input: CreateTeamInput) {
    const ref = adminDb.collection("times").doc();
    const data = {
      ...input,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };
    await ref.set(removeUndefined(data));
    return { id: ref.id, ...data };
  }

  async update(id: string, input: Partial<CreateTeamInput>) {
    const ref = adminDb.collection("times").doc(id);
    await ref.update(removeUndefined({
      ...input,
      updatedAt: FieldValue.serverTimestamp(),
    }));
    return { id, ...input };
  }

  async list() {
    const snapshot = await adminDb.collection("times").orderBy("name").get();
    return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
  }
}

export const teamAdminService = new TeamAdminService();
