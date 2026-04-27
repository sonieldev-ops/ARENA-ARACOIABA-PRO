"use client";

import { useState, useEffect, useMemo } from "react";
import { db } from "@/src/lib/firebase/client";
import {
  doc,
  onSnapshot,
  collection,
  query,
  orderBy,
  Timestamp
} from "firebase/firestore";
import { liveMatchService } from "../infrastructure/live-match.service";

export function useLiveControl(matchId: string) {
  const [match, setMatch] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingAction, setLoadingAction] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // 1. Listen Match Realtime
  useEffect(() => {
    if (!matchId) return;
    const unsub = onSnapshot(doc(db, "matches", matchId), (snap) => {
      if (snap.exists()) {
        setMatch({ id: snap.id, ...snap.data() });
      }
      setLoading(false);
    });
    return () => unsub();
  }, [matchId]);

  // 2. Listen Events Realtime
  useEffect(() => {
    if (!matchId) return;
    const q = query(
      collection(db, "matches", matchId, "events"),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setEvents(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [matchId]);

  // 3. Timer Logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (match?.status === "LIVE" && match?.startedAt) {
      const start = (match.startedAt as Timestamp).toDate().getTime();

      const updateTimer = () => {
        const now = Date.now();
        const diff = Math.floor((now - start) / 1000);
        setElapsedSeconds(diff > 0 ? diff : 0);
      };

      updateTimer();
      interval = setInterval(updateTimer, 1000);
    } else if (match?.status === "FINISHED" && match?.startedAt && match?.finishedAt) {
        const start = (match.startedAt as Timestamp).toDate().getTime();
        const end = (match.finishedAt as Timestamp).toDate().getTime();
        setElapsedSeconds(Math.floor((end - start) / 1000));
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
    } catch (e: any) {
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
    startMatch: () => wrapAction(() => liveMatchService.startMatch(matchId)),
    finishMatch: () => wrapAction(() => liveMatchService.finishMatch(matchId)),
    registerGoal: (side: 'A' | 'B', athlete?: any) =>
      wrapAction(() => liveMatchService.registerGoal(matchId, side, athlete, currentMinute)),
    registerCard: (type: 'YELLOW' | 'RED', side: 'A' | 'B', athlete?: any) =>
      wrapAction(() => liveMatchService.registerCard(matchId, type, side, athlete, currentMinute))
  };
}
