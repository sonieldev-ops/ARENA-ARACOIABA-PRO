'use client';

import { useSearchParams } from 'next/navigation';
import { useAcceptInvite } from '@/src/modules/invite/hooks/use-accept-invite';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ShieldCheck,
  UserCircle,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Trophy,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';

export default function AcceptInvitePage() {
  const searchParams = useSearchParams();
  const inviteId = searchParams.get('id');
  const { invite, loading, processing, error, currentUser, actions } = useAcceptInvite(inviteId);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
          <p className="text-slate-500 font-bold">Validando seu convite...</p>
        </div>
      </div>
    );
  }

  // 1. Estado de Erro (Convite Inválido/Expirado)
  if (error || !invite) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 p-4">
        <Card className="max-w-md w-full border-red-100 shadow-xl">
          <CardContent className="pt-10 pb-10 text-center space-y-6">
            <XCircle className="h-16 w-16 text-red-500 mx-auto" />
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-slate-900">Convite Inválido</h2>
              <p className="text-slate-500">{error || 'Não conseguimos localizar este convite.'}</p>
            </div>
            <Button asChild className="w-full bg-slate-900" size="lg">
              <Link href="/">Voltar para o Início</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 2. Estado: Não Autenticado
  if (!currentUser) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 p-4">
        <Card className="max-w-md w-full border-blue-100 shadow-xl">
          <CardContent className="pt-10 pb-10 text-center space-y-6">
            <UserCircle className="h-16 w-16 text-blue-500 mx-auto" />
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-slate-900">Identifique-se Primeiro</h2>
              <p className="text-slate-500">
                Você recebeu um convite para o time <b>{invite.teamName}</b>. Faça login com o e-mail <b>{invite.invitedEmail}</b> para aceitar.
              </p>
            </div>
            <Button asChild className="w-full bg-blue-600" size="lg">
              <Link href={`/login?callbackUrl=/invite/accept?id=${inviteId}`}>Fazer Login Agora</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 3. Estado: E-mail Logado Diferente do Convite
  if (currentUser.email !== invite.invitedEmail) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 p-4">
        <Card className="max-w-md w-full border-amber-100 shadow-xl">
          <CardContent className="pt-10 pb-10 text-center space-y-6">
            <AlertTriangle className="h-16 w-16 text-amber-500 mx-auto" />
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-slate-900">E-mail Incompatível</h2>
              <p className="text-slate-500">
                Você está logado como <b>{currentUser.email}</b>, mas este convite foi enviado para <b>{invite.invitedEmail}</b>.
              </p>
            </div>
            <Button variant="outline" className="w-full border-slate-200" onClick={() => window.location.reload()}>
              Trocar de Conta
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 4. Estado: Tela de Aceite (Happy Path)
  return (
    <div className="flex h-screen items-center justify-center bg-slate-50 p-4">
      <Card className="max-w-lg w-full overflow-hidden border-0 shadow-2xl">
        <div className="bg-blue-600 p-8 text-center text-white relative overflow-hidden">
           <Trophy className="h-20 w-20 text-white/10 absolute -right-4 -bottom-4 rotate-12" />
           <ShieldCheck className="h-12 w-12 mx-auto mb-4" />
           <h1 className="text-3xl font-black tracking-tight">Você foi convocado!</h1>
           <p className="text-blue-100 font-medium mt-2">Um novo desafio te espera na Arena Aracoiaba.</p>
        </div>

        <CardContent className="p-8 space-y-8">
          <div className="text-center space-y-2">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">CONVITE PARA A EQUIPE</p>
            <h2 className="text-4xl font-black text-slate-900">{invite.teamName}</h2>
            <div className="inline-flex items-center gap-2 bg-slate-100 px-3 py-1 rounded-full text-xs font-bold text-slate-600 mt-2">
               FUNÇÃO: {invite.role}
            </div>
          </div>

          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
              <p className="text-sm text-slate-600">Acesso ao calendário de jogos da equipe.</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
              <p className="text-sm text-slate-600">Estatísticas individuais em campeonatos oficiais.</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
              <p className="text-sm text-slate-600">Perfil público vinculado ao time.</p>
            </div>
          </div>
        </CardContent>

        <CardFooter className="p-8 pt-0 flex flex-col gap-3">
          <Button
            className="w-full bg-blue-600 hover:bg-blue-700 h-14 text-lg font-black shadow-lg shadow-blue-200"
            onClick={actions.accept}
            disabled={processing}
          >
            {processing ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <ArrowRight className="h-5 w-5 mr-2" />}
            ACEITAR CONVITE E ENTRAR
          </Button>
          <Button
            variant="ghost"
            className="w-full text-slate-400 hover:text-red-500 font-bold"
            onClick={actions.reject}
            disabled={processing}
          >
            RECUSAR CONVITE
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
