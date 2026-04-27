import { adminDb } from "@/src/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { removeUndefined } from "@/src/lib/utils";

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
    const ref = adminDb.collection("atletas").doc();
    const data = {
      ...input,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };
    await ref.set(removeUndefined(data));
    return { id: ref.id, ...data };
  }

  async update(id: string, input: Partial<CreateAthleteInput>) {
    const ref = adminDb.collection("atletas").doc(id);
    await ref.update(removeUndefined({
      ...input,
      updatedAt: FieldValue.serverTimestamp(),
    }));
    return { id, ...input };
  }

  async list() {
    const snapshot = await adminDb.collection("atletas").orderBy("name").get();
    return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
  }
}

export const athleteAdminService = new AthleteAdminService();
