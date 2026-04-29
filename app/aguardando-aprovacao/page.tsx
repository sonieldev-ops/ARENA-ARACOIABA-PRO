'use client';

import Link from 'next/link';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function PendingApprovalPage() {
  const { data, loading } = useCurrentUser();
  const router = useRouter();

  useEffect(() => {
    // Se o usuário já estiver aprovado e ativo, redireciona para o admin
    if (!loading && data?.authenticated && data.user.status === 'ACTIVE') {
      router.replace('/admin');
    }
  }, [data, loading, router]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        <p>Carregando...</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 text-white">
      <div className="max-w-lg w-full text-center space-y-6 rounded-2xl border border-white/10 bg-black/20 p-8">
        <div className="flex justify-center">
          <div className="h-16 w-16 rounded-full bg-yellow-500/20 flex items-center justify-center">
            <svg
              className="h-8 w-8 text-yellow-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>

        <h1 className="text-3xl font-bold">Solicitação enviada!</h1>

        <p className="text-zinc-300 leading-relaxed">
          Olá, <span className="font-semibold text-white">{data?.user?.name || 'usuário'}</span>.
          Seu cadastro para o perfil de <span className="text-yellow-500 font-medium">{(data?.user as any)?.requestedRole || 'solicitado'}</span> foi recebido com sucesso.
        </p>

        <div className="p-4 rounded-xl bg-zinc-900/50 border border-white/5 text-sm text-zinc-400">
          Como este é um perfil operacional sensível, nossa equipe administrativa revisará seus dados.
          Você receberá um e-mail assim que seu acesso for liberado.
        </div>

        <div className="pt-4 space-y-3">
          <Link
            href="/"
            className="block w-full rounded-xl bg-white/5 hover:bg-white/10 px-4 py-3 font-medium transition-colors"
          >
            Voltar para o Início
          </Link>

          <button
            onClick={async () => {
              await fetch('/api/auth/logout', { method: 'POST' });
              router.push('/login');
            }}
            className="text-sm text-zinc-500 hover:text-white transition-colors"
          >
            Sair e entrar com outra conta
          </button>
        </div>
      </div>
    </main>
  );
}
