import { useState, useEffect } from 'react';
import { db, auth } from '@/lib/firebase/client';
import {
  doc,
  setDoc,
  deleteDoc,
  collection,
  onSnapshot,
  query,
  serverTimestamp
} from 'firebase/firestore';

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) {
      setFavorites([]);
      setLoading(false);
      return;
    }

    const q = query(collection(db, 'usuarios', user.uid, 'favorites'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const favs = snapshot.docs.map(doc => doc.id);
      setFavorites(favs);
      setLoading(false);
    }, (error) => {
      console.error("Erro ao buscar favoritos:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const toggleFavorite = async (teamId: string) => {
    if (!user) throw new Error("Usuário não autenticado");

    const favRef = doc(db, 'usuarios', user.uid, 'favorites', teamId);

    if (favorites.includes(teamId)) {
      await deleteDoc(favRef);
    } else {
      await setDoc(favRef, {
        teamId,
        createdAt: serverTimestamp()
      });
    }
  };

  const isFavorite = (teamId: string) => favorites.includes(teamId);

  return { favorites, toggleFavorite, isFavorite, loading };
}
