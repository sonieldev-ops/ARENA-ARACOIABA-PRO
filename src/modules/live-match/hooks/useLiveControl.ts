"use client";

import { useState, useEffect } from "react";
import { db } from "@/src/lib/firebase/client";
import {
  doc,
  onSnapshot,
  collection,
  query,
  orderBy,
  Timestamp
} from "firebase/firestore";
import { toast } from "sonner";
import { liveMatchService } from "../infrastructure/live-match.service";

interface Match {
  id: string;
  status: "SCHEDULED" | "LIVE" | "FINISHED";
  startedAt?: Timestamp;
  finishedAt?: Timestamp;
  [key: string]: unknown;
}

interface MatchEvent {
  id: string;
  type: string;
  minute: number;
  [key: string]: unknown;
}

export function useLiveControl(matchId: string) {
  const [match, setMatch] = useState<Match | null>(null);
  const [events, setEvents] = useState<MatchEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingAction, setLoadingAction] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // 1. Listen Match Realtime
  useEffect(() => {
    if (!matchId) return;
    const unsub = onSnapshot(doc(db, "partidas", matchId), (snap) => {
      if (snap.exists()) {
        setMatch({ id: snap.id, ...snap.data() } as Match);
      }
      setLoading(false);
    });
    return () => unsub();
  }, [matchId]);

  // 2. Listen Events Realtime
  useEffect(() => {
    if (!matchId) return;
    const q = query(
      collection(db, "partidas", matchId, "events"),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setEvents(snap.docs.map(d => ({ id: d.id, ...d.data() } as MatchEvent)));
    });
    return () => unsub();
  }, [matchId]);

  // 3. Timer Logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (match?.status === "LIVE" && match?.startedAt) {
      const start = match.startedAt.toDate().getTime();

      const updateTimer = () => {
        const now = Date.now();
        const diff = Math.floor((now - start) / 1000);
        setElapsedSeconds(diff > 0 ? diff : 0);
      };

      updateTimer();
      interval = setInterval(updateTimer, 1000);
    } else if (match?.status === "FINISHED" && match?.startedAt && match?.finishedAt) {
        const start = match.startedAt.toDate().getTime();
        const end = match.finishedAt.toDate().getTime();
        // Evita o erro de setState sincronamente ao usar um valor calculado
        const total = Math.floor((end - start) / 1000);
        setElapsedSeconds(total);
    } else {
      setElapsedSeconds(0);
    }
    return () => clearInterval(interval);
  }, [match?.status, match?.startedAt, match?.finishedAt]);

  const isLive = match?.status === "LIVE";
  const isScheduled = match?.status === "SCHEDULED";
  const isFinished = match?.status === "FINISHED";

  const currentMinute = Math.floor(elapsedSeconds / 60);

  // Wrapper para as ações do serviço
  const wrapAction = async (actionFn: () => Promise<void>) => {
    setLoadingAction(true);
    try {
      await actionFn();
    } catch (e: unknown) {
      console.error(e);
      throw e;
    } finally {
      setLoadingAction(false);
    }
  };

  return {
    match,
    events,
    loading,
    loadingAction,
    elapsedSeconds,
    currentMinute,
    isLive,
    isScheduled,
    isFinished,
    startMatch: async () => {
      try {
        await wrapAction(() => liveMatchService.startMatch(matchId));
        toast.success("Partida iniciada!");
      } catch (e: unknown) {
        toast.error("Erro ao iniciar partida");
      }
    },
    finishMatch: async () => {
      try {
        await wrapAction(() => liveMatchService.finishMatch(matchId));
        toast.success("Partida finalizada!");
      } catch (e: unknown) {
        toast.error("Erro ao finalizar partida");
      }
    },
    registerGoal: (side: 'A' | 'B', athlete?: unknown) =>
      wrapAction(async () => {
        try {
          await liveMatchService.registerGoal(matchId, side, athlete, currentMinute, match);
          toast.success(`GOL!`);
        } catch (e: unknown) {
          toast.error("Erro ao registrar gol");
        }
      }),
    registerCard: (type: 'YELLOW' | 'RED', side: 'A' | 'B', athlete?: unknown) =>
      wrapAction(async () => {
        try {
          await liveMatchService.registerCard(matchId, type, side, athlete, currentMinute, match);
          toast.success(`Cartão registrado!`);
        } catch (e: unknown) {
          toast.error("Erro ao registrar cartão");
        }
      })
  };
}
