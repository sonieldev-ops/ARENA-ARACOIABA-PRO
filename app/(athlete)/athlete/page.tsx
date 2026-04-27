'use client';

import { useAthleteDashboard } from "@/src/modules/athlete/hooks/use-athlete-dashboard";
import { AthleteHeader } from "@/src/modules/athlete/components/AthleteHeader";
import { AthleteStatsCard } from "@/src/modules/athlete/components/AthleteStatsCard";
import { AthleteNextMatchCard } from "@/src/modules/athlete/components/AthleteNextMatchCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, LayoutGrid, Users, CalendarDays, UserCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AthleteDashboardPage() {
  const { data, loading, error } = useAthleteDashboard();

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600 mx-auto" />
          <p className="text-slate-500 font-medium">Preparando seu vestiário...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center bg-red-50 border border-red-100 rounded-2xl m-8">
        <h2 className="text-red-800 font-bold text-xl">Ops! Algo deu errado.</h2>
        <p className="text-red-600 mb-4">{error || 'Não foi possível carregar seus dados.'}</p>
        <Button onClick={() => window.location.reload()}>Tentar Novamente</Button>
      </div>
    );
  }

  const { profile, team, nextMatch, stats, notifications } = data;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* 1. Header */}
      <AthleteHeader profile={profile} team={team} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Coluna Esquerda: Principal */}
        <div className="lg:col-span-2 space-y-8">

          {/* 2. Próxima Partida */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-blue-600" />
                Sua Próxima Partida
              </h2>
            </div>
            <AthleteNextMatchCard match={nextMatch} />
          </section>

          {/* 3. Ações Rápidas */}
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <LayoutGrid className="h-5 w-5 text-blue-600" />
              Ações Rápidas
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Calendário", icon: CalendarDays, href: "/athlete/calendar" },
                { label: "Meu Time", icon: Users, href: "/athlete/team" },
                { label: "Meu Perfil", icon: UserCircle, href: "/athlete/profile" },
                { label: "Notificações", icon: Bell, href: "/athlete/notifications" },
              ].map((action, i) => (
                <Link key={i} href={action.href}>
                  <div className="bg-white p-4 rounded-xl border shadow-sm hover:border-blue-300 hover:shadow-md transition-all group flex flex-col items-center text-center">
                    <div className="p-2 rounded-lg bg-slate-50 text-slate-600 group-hover:bg-blue-50 group-hover:text-blue-600 mb-2">
                      <action.icon className="h-6 w-6" />
                    </div>
                    <span className="text-sm font-semibold text-slate-700">{action.label}</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>

        {/* Coluna Direita: Stats e Notificações */}
        <div className="space-y-8">
          {/* 4. Estatísticas */}
          <AthleteStatsCard stats={stats} />

          {/* 5. Notificações */}
          <Card className="shadow-sm border-slate-200">
            <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Bell className="h-5 w-5 text-blue-600" />
                Notificações
              </CardTitle>
              {notifications.length > 0 && (
                <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {notifications.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-6 italic">Nenhum aviso no momento.</p>
                ) : (
                  notifications.map((notif) => (
                    <div key={notif.id} className="flex gap-3 pb-3 border-b border-slate-50 last:border-0 last:pb-0">
                      <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${notif.read ? 'bg-slate-200' : 'bg-blue-600'}`} />
                      <div className="space-y-1">
                        <p className={`text-sm leading-none ${notif.read ? 'text-slate-600' : 'font-bold text-slate-900'}`}>
                          {notif.title}
                        </p>
                        <p className="text-xs text-slate-500 line-clamp-2">{notif.message}</p>
                      </div>
                    </div>
                  ))
                )}
                <Button variant="ghost" className="w-full text-xs text-blue-600 font-bold hover:bg-blue-50" asChild>
                  <Link href="/athlete/notifications">Ver Todas</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
