import { useState, useEffect } from 'react';
import { doc, onSnapshot, collection, query, where, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { UserProfile } from '@/src/types/auth';

export function useUserDetailAdmin(uid: string) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [logsLoading, setLogsLoading] = useState(true);

  useEffect(() => {
    if (!uid) return;

    setLoading(true);
    setLogsLoading(true);

    // Stream do perfil do usuário
    const userRef = doc(db, 'usuarios', uid);
    const unsubUser = onSnapshot(userRef, (snap) => {
      if (snap.exists()) {
        setUser({ uid: snap.id, ...snap.data() } as UserProfile);
      } else {
        setError('Usuário não encontrado');
      }
      setLoading(false);
    }, (err) => {
      setError(err.message);
      setLoading(false);
    });

    // Stream dos logs de auditoria
    const logsRef = collection(db, 'logs_auditoria');
    const q = query(
      logsRef,
      where('targetUserId', '==', uid),
      orderBy('createdAt', 'desc')
    );

    const unsubLogs = onSnapshot(q, (snap) => {
      const logsData = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setLogs(logsData);
      setLogsLoading(false);
    }, (err) => {
      console.error('Error fetching logs:', err);
      setLogsLoading(false);
    });

    return () => {
      unsubUser();
      unsubLogs();
    };
  }, [uid]);

  const refresh = async () => {
    // onSnapshot já lida com atualizações em tempo real,
    // mas expomos caso queira forçar um reload ou outra lógica.
  };

  const refreshLogs = async () => {
    // onSnapshot já lida com atualizações em tempo real.
  };

  return { user, logs, loading, logsLoading, error, refresh, refreshLogs };
}
