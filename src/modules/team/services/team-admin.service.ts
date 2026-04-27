import { adminDb } from "@/src/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

export interface CreateTeamInput {
  name: string;
  championshipId: string;
  championshipName: string;
  city: string;
  status: 'ACTIVE' | 'INACTIVE' | 'BLOCKED';
}

export class TeamAdminService {
  async create(input: CreateTeamInput) {
    const ref = adminDb.collection("teams").doc();
    const data = {
      ...input,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };
    await ref.set(data);
    return { id: ref.id, ...data };
  }

  async update(id: string, input: Partial<CreateTeamInput>) {
    const ref = adminDb.collection("teams").doc(id);
    await ref.update({
      ...input,
      updatedAt: FieldValue.serverTimestamp(),
    });
    return { id, ...input };
  }

  async list() {
    const snapshot = await adminDb.collection("teams").orderBy("name").get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
}

export const teamAdminService = new TeamAdminService();
