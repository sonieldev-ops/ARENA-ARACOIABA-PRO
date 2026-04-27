'use client';

import { useState, useEffect } from 'react';
import { athleteService } from '../services/athlete.service';
import { AthleteDashboardData } from '@/src/types/athlete';
import { auth } from '@/src/lib/firebase/client';
import { onAuthStateChanged } from 'firebase/auth';

export function useAthleteDashboard() {
  const [data, setData] = useState<AthleteDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const dashboardData = await athleteService.getDashboardData(user.uid);
          setData(dashboardData);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Falha ao carregar dashboard');
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
        setError('Usuário não autenticado');
      }
    });

    return () => unsubscribe();
  }, []);

  return { data, loading, error, refresh: () => auth.currentUser && athleteService.getDashboardData(auth.currentUser.uid).then(setData) };
}
