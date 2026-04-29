'use client';

import { FormEvent, useState } from 'react';
import { createUserWithEmailAndPassword, getIdToken, updateProfile } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase/client';

export function RegisterForm() {
  const router = useRouter();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [requestedRole, setRequestedRole] = useState('PUBLIC_USER');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. Cria conta no Firebase Auth (Client)
      const credential = await createUserWithEmailAndPassword(auth, email, password);

      // 2. Atualiza nome no perfil do Firebase Auth
      if (auth.currentUser && fullName.trim()) {
        await updateProfile(auth.currentUser, { displayName: fullName.trim() });
      }

      // 3. Pega o ID Token forçando refresh para garantir que qualquer trigger de backend já tenha rodado (embora nosso fluxo seja síncrono via API)
      const idToken = await getIdToken(credential.user, true);

      // 4. Chama o backend para criar perfil, claims e sessão
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idToken,
          fullName,
          phone,
          requestedRole,
        }),
      });

      const body = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(body.error || 'Falha ao concluir cadastro');
      }

      // 5. Redireciona baseado na necessidade de aprovação
      const approvalRequired = body?.user?.approvalRequired === true;
      router.replace(approvalRequired ? '/aguardando-aprovacao' : '/admin');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao cadastrar');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-white/10 bg-black/20 p-6">
      <div>
        <label htmlFor="fullName" className="mb-2 block text-sm font-medium text-white">
          Nome completo
        </label>
        <input
          id="fullName"
          type="text"
          className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-white outline-none"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />
      </div>

      <div>
        <label htmlFor="phone" className="mb-2 block text-sm font-medium text-white">
          Telefone
        </label>
        <input
          id="phone"
          type="text"
          className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-white outline-none"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="role" className="mb-2 block text-sm font-medium text-white">
          Perfil solicitado
        </label>
        <select
          id="role"
          className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-white outline-none"
          value={requestedRole}
          onChange={(e) => setRequestedRole(e.target.value)}
        >
          <option value="PUBLIC_USER">Usuário público</option>
          <option value="ATHLETE">Atleta</option>
          <option value="TEAM_MANAGER">Responsável de equipe</option>
          <option value="REFEREE">Árbitro</option>
          <option value="STAFF">Staff</option>
          <option value="ORGANIZER">Organizador</option>
        </select>
      </div>

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
          autoComplete="new-password"
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
        {loading ? 'Criando conta...' : 'Criar conta'}
      </button>
    </form>
  );
}
