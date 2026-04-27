'use client';

import { useEffect, useState } from 'react';
import { UserSession } from '@/src/types/auth';

type CurrentUserResponse =
  | { authenticated: true; user: UserSession }
  | { authenticated: false; user: null };

export function useCurrentUser() {
  const [data, setData] = useState<CurrentUserResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    fetch('/api/auth/me', { cache: 'no-store' })
      .then(async (res) => {
        const body = await res.json();
        if (!active) return;
        setData(body);
      })
      .catch(() => {
        if (!active) return;
        setData({ authenticated: false, user: null });
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return { data, loading };
}
