import { adminDb } from "@/src/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

export interface CreateChampionshipInput {
  name: string;
  season: string;
  city: string;
  description?: string;
  status: 'ACTIVE' | 'SCHEDULED' | 'FINISHED';
}

export class ChampionshipAdminService {
  async create(input: CreateChampionshipInput) {
    const ref = adminDb.collection("championships").doc();
    const data = {
      ...input,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };
    await ref.set(data);
    return { id: ref.id, ...data };
  }

  async update(id: string, input: Partial<CreateChampionshipInput>) {
    const ref = adminDb.collection("championships").doc(id);
    await ref.update({
      ...input,
      updatedAt: FieldValue.serverTimestamp(),
    });
    return { id, ...input };
  }

  async list() {
    const snapshot = await adminDb.collection("championships").orderBy("createdAt", "desc").get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
}

export const championshipAdminService = new ChampionshipAdminService();
