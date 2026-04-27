import { adminDb } from "@/src/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { removeUndefined } from "@/src/lib/utils";

export interface CreateChampionshipInput {
  name: string;
  season: string;
  city: string;
  description?: string;
  status: 'ACTIVE' | 'SCHEDULED' | 'FINISHED';
}

export class ChampionshipAdminService {
  async create(input: CreateChampionshipInput) {
    const ref = adminDb.collection("campeonatos").doc();
    const data = {
      ...input,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };
    await ref.set(removeUndefined(data));
    return { id: ref.id, ...data };
  }

  async update(id: string, input: Partial<CreateChampionshipInput>) {
    const ref = adminDb.collection("campeonatos").doc(id);
    await ref.update(removeUndefined({
      ...input,
      updatedAt: FieldValue.serverTimestamp(),
    }));
    return { id, ...input };
  }

  async list() {
    const snapshot = await adminDb.collection("campeonatos").orderBy("createdAt", "desc").get();
    return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
  }
}

export const championshipAdminService = new ChampionshipAdminService();
