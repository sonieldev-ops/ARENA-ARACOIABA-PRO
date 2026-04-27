import { adminDb } from "@/src/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

export interface CreateAthleteInput {
  name: string;
  teamId: string;
  teamName: string;
  position: string;
  number: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
}

export class AthleteAdminService {
  async create(input: CreateAthleteInput) {
    const ref = adminDb.collection("athletes").doc();
    const data = {
      ...input,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };
    await ref.set(data);
    return { id: ref.id, ...data };
  }

  async update(id: string, input: Partial<CreateAthleteInput>) {
    const ref = adminDb.collection("athletes").doc(id);
    await ref.update({
      ...input,
      updatedAt: FieldValue.serverTimestamp(),
    });
    return { id, ...input };
  }

  async list() {
    const snapshot = await adminDb.collection("athletes").orderBy("name").get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
}

export const athleteAdminService = new AthleteAdminService();
