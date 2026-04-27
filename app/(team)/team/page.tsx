'use client';

import { useTeamManagerDashboard } from "@/src/modules/team/hooks/use-team-manager-dashboard";
import { TeamHeader } from "@/src/modules/team/components/TeamHeader";
import { TeamRosterTable } from "@/src/modules/team/components/TeamRosterTable";
import { TeamInvitePlayerDialog } from "@/src/modules/team/components/TeamInvitePlayerDialog";
import { TeamCompetitionsCard } from "@/src/modules/team/components/TeamCompetitionsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  Trophy,
  Loader2,
  AlertCircle,
  PlusCircle,
  MailQuestion,
  Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function TeamManagerDashboardPage() {
  const { data, loading, error, actions } = useTeamManagerDashboard();

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600 mx-auto" />
          <p className="text-slate-500 font-medium">Convocando o elenco...</p>
        </div>
      </div>
    );
  }

  // Estado: Sem Time cadastrado
  if (!data?.team) {
    return (
      <div className="max-w-2xl mx-auto mt-20 text-center space-y-8 p-12 bg-white rounded-3xl border shadow-xl">
        <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto">
          <PlusCircle className="h-12 w-12 text-blue-600" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-black text-slate-900">Crie seu Time Oficial</h1>
          <p className="text-slate-500 text-lg">
            Você ainda não possui um time vinculado. Comece agora para poder convidar atletas e disputar campeonatos.
          </p>
        </div>
        <Button size="lg" className="bg-blue-600 hover:bg-blue-700 h-14 px-10 font-black text-lg" asChild>
          <Link href="/team/create">CRIAR MEU TIME AGORA</Link>
        </Button>
      </div>
    );
  }

  const { team, members, invites, availableCompetitions } = data;

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-10">
      {/* 1. Identificação do Time */}
      <TeamHeader team={team} memberCount={members.length} />

      {/* 2. Área de Ação e Elenco */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

        {/* Coluna Esquerda: Gestão de Atletas */}
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
              <Users className="h-6 w-6 text-blue-600" />
              Gestão de Elenco
            </h2>
            <TeamInvitePlayerDialog onInvite={actions.invitePlayer} />
          </div>

          <TeamRosterTable members={members} onRemove={actions.removeMember} />

          {/* Convites Pendentes */}
          {invites.length > 0 && (
            <Card className="border-amber-100 bg-amber-50/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold text-amber-800 flex items-center gap-2">
                  <MailQuestion className="h-4 w-4" />
                  Convites Aguardando Resposta ({invites.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {invites.map((invite) => (
                    <div key={invite.id} className="bg-white border border-amber-200 px-3 py-1.5 rounded-lg text-xs font-medium text-amber-700 flex items-center gap-2">
                      {invite.invitedEmail}
                      <span className="text-[10px] bg-amber-100 px-1.5 py-0.5 rounded text-amber-600 font-bold uppercase">
                        {invite.role}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Coluna Direita: Competições */}
        <div className="space-y-8">
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Trophy className="h-6 w-6 text-amber-500" />
            Arena Pro
          </h2>
          <TeamCompetitionsCard
            competitions={availableCompetitions}
            onRegister={actions.registerInCompetition}
          />

          <Card className="bg-slate-900 text-white border-0 overflow-hidden relative">
             <CardContent className="pt-6">
                <div className="relative z-10">
                  <h3 className="font-bold mb-2">Dica de Gestor</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Mantenha seu elenco atualizado. Apenas jogadores ativos com status "ACTIVE" podem ser escalados em súmulas de partidas oficiais.
                  </p>
                </div>
                <div className="absolute -right-4 -bottom-4 opacity-10">
                  <Shield className="h-24 w-24" />
                </div>
             </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
