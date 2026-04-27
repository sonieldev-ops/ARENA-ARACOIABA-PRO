'use client';

import { FormEvent, useState } from 'react';
import { signInWithEmailAndPassword, getIdToken } from 'firebase/auth';
import { useRouter, useSearchParams } from 'next/navigation';
import { auth } from '@/lib/firebase/client';

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') || '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await getIdToken(credential.user, true);

      const res = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || 'Falha ao criar sessão');
      }

      router.replace(next);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao entrar');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-white/10 bg-black/20 p-6">
      <div>
        <label htmlFor="email" className="mb-2 block text-sm font-medium text-white">
          E-mail
        </label>
        <input
          id="email"
          type="email"
          className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-white outline-none"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
        />
      </div>

      <div>
        <label htmlFor="password" className="mb-2 block text-sm font-medium text-white">
          Senha
        </label>
        <input
          id="password"
          type="password"
          className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-white outline-none"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
        />
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-yellow-500 px-4 py-3 font-semibold text-black disabled:opacity-60"
      >
        {loading ? 'Entrando...' : 'Entrar'}
      </button>
    </form>
  );
}
