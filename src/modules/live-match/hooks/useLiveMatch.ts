"use client";

import { useEffect, useState } from "react";
import { db } from "@/src/lib/firebase/client";
import { doc, onSnapshot, collection, query, orderBy } from "firebase/firestore";

export function useLiveMatch(matchId: string) {
  const [match, setMatch] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!matchId) return;

    // Listener para dados básicos e placar da partida
    const unsubMatch = onSnapshot(doc(db, "matches", matchId), (snap) => {
      if (snap.exists()) {
        setMatch({ id: snap.id, ...snap.data() });
      }
      setLoading(false);
    });

    // Listener para a Timeline de eventos (Gols, Cartões, etc)
    const eventsQuery = query(
      collection(db, "matches", matchId, "events"),
      orderBy("minute", "desc"),
      orderBy("createdAt", "desc")
    );

    const unsubEvents = onSnapshot(eventsQuery, (snap) => {
      setEvents(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => {
      unsubMatch();
      unsubEvents();
    };
  }, [matchId]);

  return { match, events, loading };
}
