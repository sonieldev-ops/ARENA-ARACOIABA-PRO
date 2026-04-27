'use client';

import React from 'react';
import {
  Trophy,
  Zap,
  History,
  Clock,
  User,
  ShieldCheck,
  Info,
  Calendar,
  AlertTriangle,
  Play,
  Pause,
  CheckCircle2,
  FileText
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatFirebaseDate, cn, translateEventType } from '@/src/lib/utils';
import { Match, MatchEvent } from '@/src/types/match';

interface OfficialMatchSummaryProps {
  match: Match;
  events: MatchEvent[];
  isAdminView?: boolean;
}

export function OfficialMatchSummary({ match, events, isAdminView = false }: OfficialMatchSummaryProps) {
  const goals = events.filter(e => e.type === 'GOAL');
  const cards = events.filter(e => e.type === 'YELLOW_CARD' || e.type === 'RED_CARD');

  const calculateMatchMinute = (event: MatchEvent) => {
    if (event.minute) return `${event.minute}'`;
    if (!match.actualStartTime || !event.timestamp) return "??'";

    const start = match.actualStartTime.seconds
      ? match.actualStartTime.seconds * 1000
      : new Date(match.actualStartTime).getTime();

    const eventTime = event.timestamp.seconds
      ? event.timestamp.seconds * 1000
      : new Date(event.timestamp).getTime();

    const diff = Math.floor((eventTime - start) / 60000);
    return `${Math.max(0, diff)}'`;
  };

  const getEventStyle = (type: string) => {
    switch (type) {
      case 'GOAL': return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.1)]';
      case 'YELLOW_CARD': return 'bg-amber-500/10 border-amber-500/20 text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.1)]';
      case 'RED_CARD': return 'bg-red-500/10 border-red-500/20 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.1)]';
      case 'MATCH_STARTED':
      case 'MATCH_FINISHED':
      case 'START':
      case 'END': return 'bg-zinc-100/5 border-zinc-100/10 text-zinc-300 shadow-[0_0_15px_rgba(255,255,255,0.05)]';
      case 'OBSERVATION': return 'bg-blue-500/10 border-blue-500/20 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.1)]';
      default: return 'bg-zinc-800 border-white/5 text-zinc-400';
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'GOAL': return <Trophy className="w-4 h-4" />;
      case 'YELLOW_CARD': return <div className="w-3 h-4 bg-amber-500 rounded-sm" />;
      case 'RED_CARD': return <div className="w-3 h-4 bg-red-500 rounded-sm" />;
      case 'MATCH_STARTED':
      case 'START': return <Play className="w-4 h-4 fill-current" />;
      case 'MATCH_FINISHED':
      case 'END': return <CheckCircle2 className="w-4 h-4" />;
      case 'MATCH_PAUSED': return <Pause className="w-4 h-4" />;
      case 'OBSERVATION': return <FileText className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  const isEmpty = events.length === 0;
  const isFinishedEmpty = match.status === 'FINISHED' && goals.length === 0 && cards.length === 0;

  return (
    <div className="space-y-8">
      {/* SÚMULA OFICIAL DE PARTIDA - Timeline */}
      <Card className="bg-zinc-900/50 border-white/5 rounded-[2rem] overflow-hidden backdrop-blur-sm">
        <CardHeader className="p-8 border-b border-white/5 bg-zinc-900/40">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-2xl bg-red-600/10 flex items-center justify-center border border-red-600/20">
                  <History className="w-6 h-6 text-red-600" />
               </div>
               <div>
                  <CardTitle className="text-2xl font-black italic uppercase text-white tracking-tighter">
                    SÚMULA OFICIAL DE PARTIDA
                  </CardTitle>
                  <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-0.5">Registros oficiais em tempo real</p>
               </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {match.currentPeriod && (
                <Badge className="bg-blue-600 text-white border-none px-4 py-1.5 font-black uppercase tracking-widest text-[10px]">
                  {match.currentPeriod === '1T' ? '1º TEMPO' : match.currentPeriod === '2T' ? '2º TEMPO' : match.currentPeriod}
                </Badge>
              )}
              {match.stoppageTime && match.stoppageTime > 0 && (
                <Badge className="bg-red-600 text-white border-none px-4 py-1.5 font-black uppercase tracking-widest text-[10px]">
                  +{match.stoppageTime} MIN ACŔESC.
                </Badge>
              )}
              <Badge className="bg-red-600/10 text-red-500 border-red-500/20 px-4 py-1.5 font-black uppercase tracking-widest text-[10px] animate-pulse">
                EM TEMPO REAL
              </Badge>
              {match.status === 'FINISHED' && (
                 <Badge className="bg-emerald-600/10 text-emerald-500 border-emerald-500/20 px-4 py-1.5 font-black uppercase tracking-widest text-[10px]">
                   SÚMULA FINALIZADA
                 </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-8">
          <div className="space-y-6">
            {!isEmpty ? (
              <div className="relative space-y-6">
                {/* Linha vertical central para timeline */}
                <div className="absolute left-[23px] top-0 bottom-0 w-[2px] bg-zinc-800/50" />

                {events.map((event, idx) => (
                  <div key={event.id || idx} className="relative flex gap-6 animate-in slide-in-from-left-4 duration-500" style={{ animationDelay: `${idx * 50}ms` }}>
                    {/* Indicador de Tempo */}
                    <div className="z-10 flex flex-col items-center justify-center w-12 h-12 rounded-2xl bg-black border border-zinc-800 shrink-0 shadow-xl">
                      <span className="text-xs font-black italic text-red-600">
                        {calculateMatchMinute(event)}
                      </span>
                    </div>

                    {/* Conteúdo do Evento */}
                    <div className={cn(
                      "flex-1 p-6 rounded-[1.5rem] border transition-all hover:scale-[1.01] duration-300",
                      getEventStyle(event.type)
                    )}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-lg bg-black/20">
                            {getEventIcon(event.type)}
                          </div>
                          <span className="text-[11px] font-black uppercase tracking-[0.1em]">{translateEventType(event.type)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase">
                           <Clock className="w-3 h-3" />
                           {formatFirebaseDate(event.timestamp || event.createdAt)}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <p className="font-black text-white text-lg uppercase italic tracking-tight leading-tight">
                           {event.description}
                        </p>

                        {(event.athleteName || event.playerName) && (
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                             <div className="flex items-center gap-1.5 text-zinc-300 text-[11px] font-black uppercase tracking-tighter">
                                <User className="w-3.5 h-3.5 text-zinc-500" />
                                Atleta: <span className="text-white">{event.athleteName || event.playerName}</span>
                             </div>
                             {(event.teamName || event.teamId) && (
                               <div className="flex items-center gap-1.5 text-zinc-300 text-[11px] font-black uppercase tracking-tighter">
                                  <ShieldCheck className="w-3.5 h-3.5 text-zinc-500" />
                                  Time: <span className="text-white">{event.teamName || (event.teamId === match.teamAId ? match.teamAName : match.teamBName)}</span>
                               </div>
                             )}
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-3 border-t border-white/5 mt-2">
                           <div className="flex items-center gap-1.5 text-zinc-500 text-[9px] font-black uppercase">
                              <ShieldCheck className="w-3 h-3" />
                              Registrado por: <span className="text-zinc-400">{event.createdByName || 'Árbitro'}</span>
                           </div>
                           {event.official && (
                             <Badge variant="outline" className="text-[8px] border-emerald-500/20 text-emerald-500/50 py-0 px-2 font-black">
                               OFICIAL
                             </Badge>
                           )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {match.status !== 'FINISHED' && (
                  <div className="flex items-center gap-6 opacity-50">
                    <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-dashed border-zinc-700 flex items-center justify-center">
                       <div className="w-2 h-2 rounded-full bg-zinc-700 animate-pulse" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 italic">
                      Aguardando próximos eventos...
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-24 text-center space-y-6">
                <div className="relative mx-auto w-24 h-24">
                  <div className="absolute inset-0 bg-red-600/10 rounded-full animate-ping" />
                  <div className="relative bg-zinc-950 w-24 h-24 rounded-full flex items-center justify-center border border-white/5 shadow-2xl">
                    <History className="w-12 h-12 text-zinc-800" />
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-white font-black uppercase tracking-[0.1em] text-lg italic">
                    {isFinishedEmpty
                      ? "Partida finalizada sem gols ou cartões registrados."
                      : "Nenhum evento registrado na súmula até o momento."}
                  </p>
                  <p className="text-zinc-500 text-xs font-medium max-w-xs mx-auto">
                    {match.status === 'LIVE'
                      ? "As ações do árbitro aparecerão aqui em tempo real assim que forem registradas."
                      : "Esta partida não teve ocorrências oficiais registradas."}
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Resumo de Estatísticas (Gols e Cartões) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card de Gols */}
        <Card className="bg-zinc-900/50 border-white/5 rounded-[3rem] overflow-hidden">
          <CardHeader className="p-8 border-b border-white/5">
            <CardTitle className="text-sm font-black italic uppercase flex items-center gap-3 text-white tracking-[0.2em]">
              <Trophy className="w-5 h-5 text-emerald-500" /> GOLS CONFIRMADOS
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="space-y-4">
              {goals.length > 0 ? goals.map((goal, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-black/40 rounded-2xl border border-white/5 hover:border-emerald-500/20 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 font-black italic group-hover:scale-110 transition-transform">
                      {i + 1}º
                    </div>
                    <div>
                      <p className="text-base font-black text-white uppercase italic tracking-tight">{goal.athleteName || goal.playerName}</p>
                      <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-0.5">
                        Time: <span className="text-zinc-300">{goal.teamName || (goal.teamId === match.teamAId ? match.teamAName : match.teamBName)}</span>
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-emerald-500/10 text-emerald-500 border-none font-black text-[9px] px-3">GOL</Badge>
                </div>
              )) : (
                <div className="py-10 text-center border-2 border-dashed border-white/5 rounded-3xl">
                  <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest italic">Nenhum gol registrado</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Card de Cartões */}
        <Card className="bg-zinc-900/50 border-white/5 rounded-[3rem] overflow-hidden">
          <CardHeader className="p-8 border-b border-white/5">
            <CardTitle className="text-sm font-black italic uppercase flex items-center gap-3 text-white tracking-[0.2em]">
              <AlertTriangle className="w-5 h-5 text-amber-500" /> DISCIPLINA OFICIAL
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="space-y-4">
              {cards.length > 0 ? cards.map((card, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-black/40 rounded-2xl border border-white/5 hover:border-zinc-700 transition-all">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-5 h-8 rounded-md shadow-[0_0_15px_rgba(0,0,0,0.5)] transition-transform hover:rotate-12",
                      card.type === 'YELLOW_CARD' ? 'bg-amber-400' : 'bg-red-600'
                    )} />
                    <div>
                      <p className="text-base font-black text-white uppercase italic tracking-tight">{card.athleteName || card.playerName}</p>
                      <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-0.5">
                        Time: <span className="text-zinc-300">{card.teamName || (card.teamId === match.teamAId ? match.teamAName : match.teamBName)}</span>
                      </p>
                    </div>
                  </div>
                  <Badge className={cn(
                    "text-[9px] font-black uppercase px-3 py-1 border-none",
                    card.type === 'YELLOW_CARD' ? 'bg-amber-500/10 text-amber-500' : 'bg-red-500/10 text-red-500'
                  )}>
                    {card.type === 'YELLOW_CARD' ? 'AMARELO' : 'VERMELHO'}
                  </Badge>
                </div>
              )) : (
                <div className="py-10 text-center border-2 border-dashed border-white/5 rounded-3xl">
                  <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest italic">Nenhum cartão registrado</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
