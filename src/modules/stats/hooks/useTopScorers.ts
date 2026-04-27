"use client";

import { useEffect, useState } from "react";
import { db } from "@/src/lib/firebase/client";
import { collection, onSnapshot, query, orderBy, limit } from "firebase/firestore";

export interface TopScorer {
  playerId: string;
  playerName: string;
  teamId: string;
  teamName: string;
  goals: number;
  matchesPlayed: number;
  updatedAt: any;
}

export function useTopScorers(championshipId: string, maxResults: number = 10) {
  const [players, setPlayers] = useState<TopScorer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!championshipId) return;

    const q = query(
      collection(db, "classificacoes", championshipId, "scorers"),
      orderBy("goals", "desc"),
      limit(maxResults)
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const scorersData = snap.docs.map((doc) => ({
          ...doc.data(),
        })) as TopScorer[];

        setPlayers(scorersData);
        setLoading(false);
      },
      (err) => {
        console.error("[useTopScorers] Erro ao buscar artilharia:", err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [championshipId, maxResults]);

  return { players, loading, error };
}
