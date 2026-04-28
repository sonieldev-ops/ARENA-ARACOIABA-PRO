import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  query,
  orderBy,
  deleteDoc,
  serverTimestamp,
  getDoc
} from 'firebase/firestore';
import { db } from '@/src/lib/firebase/client';
import { Referee } from './types';

const COLLECTION_NAME = 'arbitros';

export const refereesService = {
  async getAll(): Promise<Referee[]> {
    const q = query(collection(db, COLLECTION_NAME), orderBy('fullName', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Referee));
  },

  async getById(id: string): Promise<Referee | null> {
    const docRef = doc(db, COLLECTION_NAME, id);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() } as Referee;
    }
    return null;
  },

  async create(data: Omit<Referee, 'id' | 'gamesCount'>): Promise<string> {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...data,
      gamesCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  },

  async update(id: string, data: Partial<Referee>): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
  },

  async delete(id: string): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  },

  async assignToMatch(matchId: string, assignment: Record<string, string>): Promise<void> {
    const matchRef = doc(db, 'partidas', matchId);

    // Preparar o objeto de árbitros com nomes para denormalização se necessário
    const refereeDetails: Record<string, string | number> = {};

    // Mapeamento de chaves da tela para chaves do banco
    const mapping: Record<string, string> = {
      main: 'main',
      assistant1: 'assistant1',
      assistant2: 'assistant2',
      fourth: 'fourth',
      scorer: 'scorer'
    };

    for (const [key, refereeId] of Object.entries(assignment)) {
      if (refereeId) {
        const refData = await this.getById(refereeId);
        if (refData) {
          const dbKey = mapping[key];
          if (dbKey) {
            refereeDetails[`referees.${dbKey}`] = refereeId;
            refereeDetails[`referees.${dbKey}Name`] = refData.fullName;

            // Opcional: Incrementar contador de jogos do árbitro
            await this.update(refereeId, {
              gamesCount: (refData.gamesCount || 0) + 1,
              lastMatchDate: new Date().toISOString().split('T')[0]
            });
          }
        }
      }
    }

    await updateDoc(matchRef, refereeDetails);
  }
};
