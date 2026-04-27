'use client';

import { useParams, useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from 'sonner';
import {
  ArrowLeft,
  Loader2,
  Trophy,
  User,
  Timer,
  AlertCircle,
  History,
  Zap,
  ArrowRightLeft
} from 'lucide-react';
import { useLiveControl } from '@/src/modules/live-match/hooks/useLiveControl';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function LiveMatchControlPage() {
  const { id } = useParams();
  const router = useRouter();
  const {
    match,
    events,
    loading,
    loadingAction,
    elapsedSeconds,
    currentMinute,
    isLive,
    isScheduled,
    isFinished,
    startMatch,
    finishMatch,
    registerGoal,
    registerCard
  } = useLiveControl(id as string);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-slate-950">
      <Loader2 className="h-10 w-10 animate-spin text-red-600" />
      <p className="text-slate-400 font-medium">Sincronizando com Arena...</p>
    </div>
  );

  if (!match) return <div className="p-8 text-center text-white">Partida não encontrada</div>;

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-black text-slate-200 p-4 md:p-8">
      {/* Header com Seletor e Voltar */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="text-slate-400 hover:text-white">
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
               <Zap className="h-5 w-5 text-yellow-500 fill-yellow-500" />
               <h1 className="text-2xl font-black text-white uppercase italic">Modo Árbitro</h1>
            </div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-tighter">Painel de controle em tempo real</p>
          </div>
        </div>

        <Badge variant={isLive ? "destructive" : "outline"} className="px-4 py-1 font-black animate-pulse">
           {isLive ? "• AO VIVO" : isFinished ? "FINALIZADA" : "AGENDADA"}
        </Badge>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Coluna Central: Placar e Cronômetro */}
        <div className="lg:col-span-8 space-y-8">

          {/* Placar Premium */}
          <div className="bg-slate-900 border border-slate-800 rounded-[40px] p-10 shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent opacity-50" />

             <div className="flex items-center justify-between gap-4">
                <div className="flex-1 text-center">
                   <div className="w-20 h-20 bg-slate-800 rounded-3xl mx-auto mb-4 flex items-center justify-center text-3xl font-black border border-slate-700">
                      {match.teamAName[0]}
                   </div>
                   <h2 className="text-xl font-black text-white uppercase tracking-tight">{match.teamAName}</h2>
                </div>

                <div className="flex flex-col items-center">
                   <div className="flex items-center gap-8">
                      <span className="text-8xl font-black text-white tabular-nums tracking-tighter">
                        {typeof match.scoreA === 'object' ? '?' : (match.scoreA ?? 0)}
                      </span>
                      <span className="text-4xl font-black text-slate-700 italic">-</span>
                      <span className="text-8xl font-black text-white tabular-nums tracking-tighter">
                        {typeof match.scoreB === 'object' ? '?' : (match.scoreB ?? 0)}
                      </span>
                   </div>

                   <div className="mt-6 bg-white/5 border border-white/10 px-6 py-2 rounded-full shadow-inner">
                      <span className="text-3xl font-mono font-black text-blue-500 tabular-nums">
                        {formatTime(elapsedSeconds)}
                      </span>
                   </div>
                </div>

                <div className="flex-1 text-center">
                   <div className="w-20 h-20 bg-slate-800 rounded-3xl mx-auto mb-4 flex items-center justify-center text-3xl font-black border border-slate-700">
                      {match.teamBName[0]}
                   </div>
                   <h2 className="text-xl font-black text-white uppercase tracking-tight">{match.teamBName}</h2>
                </div>
             </div>
          </div>

          {/* Controles do Jogo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <Card className="bg-slate-900 border-slate-800 rounded-3xl overflow-hidden">
                <CardHeader className="border-b border-slate-800 bg-slate-800/30">
                   <CardTitle className="text-sm font-black uppercase flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-yellow-500" /> Ações - {match.teamAName}
                   </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                   <Button
                    disabled={!isLive || loadingAction}
                    onClick={() => registerGoal('A')}
                    className="w-full py-8 bg-green-600 hover:bg-green-500 font-black text-lg rounded-2xl"
                   >
                     {loadingAction ? <Loader2 className="animate-spin" /> : "⚽ GOL"}
                   </Button>
                   <div className="grid grid-cols-2 gap-4">
                      <Button
                        disabled={!isLive || loadingAction}
                        onClick={() => registerCard('YELLOW', 'A')}
                        className="bg-orange-500 hover:bg-orange-400 font-black"
                      >
                         🟨 CARTÃO
                      </Button>
                      <Button
                        disabled={!isLive || loadingAction}
                        onClick={() => registerCard('RED', 'A')}
                        className="bg-red-600 hover:bg-red-500 font-black"
                      >
                         🟥 CARTÃO
                      </Button>
                   </div>
                </CardContent>
             </Card>

             <Card className="bg-slate-900 border-slate-800 rounded-3xl overflow-hidden">
                <CardHeader className="border-b border-slate-800 bg-slate-800/30">
                   <CardTitle className="text-sm font-black uppercase flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-yellow-500" /> Ações - {match.teamBName}
                   </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                   <Button
                    disabled={!isLive || loadingAction}
                    onClick={() => registerGoal('B')}
                    className="w-full py-8 bg-green-600 hover:bg-green-500 font-black text-lg rounded-2xl"
                   >
                     {loadingAction ? <Loader2 className="animate-spin" /> : "⚽ GOL"}
                   </Button>
                   <div className="grid grid-cols-2 gap-4">
                      <Button
                        disabled={!isLive || loadingAction}
                        onClick={() => registerCard('YELLOW', 'B')}
                        className="bg-orange-500 hover:bg-orange-400 font-black"
                      >
                         🟨 CARTÃO
                      </Button>
                      <Button
                        disabled={!isLive || loadingAction}
                        onClick={() => registerCard('RED', 'B')}
                        className="bg-red-600 hover:bg-red-500 font-black"
                      >
                         🟥 CARTÃO
                      </Button>
                   </div>
                </CardContent>
             </Card>
          </div>

          {/* Master Controls */}
          <div className="flex justify-center gap-4 pt-4">
             {isScheduled && (
               <Button onClick={startMatch} disabled={loadingAction} className="bg-blue-600 hover:bg-blue-500 px-12 py-8 rounded-3xl font-black text-xl shadow-lg shadow-blue-900/20">
                  {loadingAction ? <Loader2 className="animate-spin mr-2" /> : null}
                  INICIAR PARTIDA
               </Button>
             )}
             {isLive && (
               <Button onClick={() => { if(confirm("Finalizar jogo?")) finishMatch() }} disabled={loadingAction} variant="destructive" className="px-12 py-8 rounded-3xl font-black text-xl">
                  {loadingAction ? <Loader2 className="animate-spin mr-2" /> : null}
                  FINALIZAR PARTIDA
               </Button>
             )}
          </div>
        </div>

        {/* Coluna Lateral: Timeline de Eventos */}
        <div className="lg:col-span-4 space-y-6">
           <Card className="bg-slate-900 border-slate-800 rounded-3xl h-[600px] flex flex-col overflow-hidden">
              <CardHeader className="border-b border-slate-800">
                 <CardTitle className="text-sm font-black uppercase flex items-center gap-2 text-slate-400">
                    <History className="h-4 w-4" /> Timeline de Eventos
                 </CardTitle>
              </CardHeader>
              <ScrollArea className="flex-1 p-6">
                 {events.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center opacity-20 py-20">
                       <AlertCircle className="h-12 w-12 mb-4" />
                       <p className="font-black italic">Sem eventos registrados</p>
                    </div>
                 ) : (
                    <div className="space-y-6">
                       {events.map((event, idx) => (
                          <div key={event.id} className="relative flex gap-4">
                             {idx !== events.length - 1 && (
                                <div className="absolute left-[11px] top-6 w-[2px] h-full bg-slate-800" />
                             )}
                             <div className="z-10 w-6 h-6 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center text-[10px] font-black text-red-500">
                                {event.minute}'
                             </div>
                             <div className="pb-4">
                                <p className="text-sm font-black text-white flex items-center gap-2">
                                   {event.type === 'GOAL' ? '⚽ GOL!' : event.type === 'YELLOW_CARD' ? '🟨 Cartão Amarelo' : '🟥 Cartão Vermelho'}
                                </p>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-tighter">
                                   {event.teamName} {event.athleteName && `• ${event.athleteName}`}
                                </p>
                             </div>
                          </div>
                       ))}
                    </div>
                 )}
              </ScrollArea>
           </Card>
        </div>

      </div>
    </div>
  );
}
