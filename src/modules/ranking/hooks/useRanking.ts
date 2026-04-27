"use client";

import { useEffect, useState } from "react";
import { db } from "@/src/lib/firebase/client";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";

export function useRanking(championshipId: string) {
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!championshipId) return;

    // Acessa a subcoleção de times dentro do documento do ranking do campeonato
    const q = query(
      collection(db, "classificacoes", championshipId, "teams"),
      orderBy("position", "asc")
    );

    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({
        id: d.id,
        ...d.data()
      }));
      setTeams(data);
      setLoading(false);
    }, (error) => {
      console.error("Erro ao carregar ranking:", error);
      setLoading(false);
    });

    return () => unsub();
  }, [championshipId]);

  return { teams, loading };
}
