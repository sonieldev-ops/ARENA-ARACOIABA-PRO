'use client';

export const dynamic = 'force-static';

import { useState, useEffect } from 'react';
import { useLiveControl } from '@/hooks/useLiveControl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trophy, Users, AlertTriangle, Play, Pause, Square, Loader2, Shirt, Clock, CheckCircle2, FileText, ClipboardCheck, History } from 'lucide-react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from 'sonner';
import { cn } from '@/src/lib/utils';
import { MatchService } from '@/lib/firebase/match-service';
import { db } from '@/src/lib/firebase/client';
import { OfficialMatchSummary } from '@/src/modules/match/components/OfficialMatchSummary';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// Componente Interno para o Cronômetro em Tempo Real
function MatchTimer({ startTime, status, period, stoppage }: { startTime: any, status: string, period?: string, stoppage?: number }) {
  const [elapsed, setElapsed] = useState('00:00');

  useEffect(() => {
    // Se a partida não está LIVE, ou se está em INTERVALO/FIM, zeramos o cronômetro visual
    if (status !== 'LIVE' || period === 'INTERVALO' || period === 'FIM') {
      setElapsed('00:00');
      return;
    }

    if (!startTime) {
      setElapsed('00:00');
      return;
    }

    const interval = setInterval(() => {
      const start = startTime?.toDate ? startTime.toDate().getTime() : new Date(startTime).getTime();
      const now = new Date().getTime();
      const diff = Math.floor((now - start) / 1000);

      if (diff < 0) {
        setElapsed('00:00');
        return;
      }

      const minutes = Math.floor(diff / 60).toString().padStart(2, '0');
      const seconds = (diff % 60).toString().padStart(2, '0');

      setElapsed(`${minutes}:${seconds}`);
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime, status, period]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-2">
        <Badge className="bg-blue-600 text-white font-black px-4 py-1 rounded-lg text-lg italic">
          {period || '1T'}
        </Badge>
        {stoppage && stoppage > 0 && (
          <Badge className="bg-red-600 text-white font-black px-4 py-1 rounded-lg text-lg italic animate-pulse">
            +{stoppage} MIN
          </Badge>
        )}
      </div>

      <div className="text-7xl font-black font-mono tracking-tighter text-blue-600 bg-white px-12 py-6 rounded-[2.5rem] border-4 border-blue-50 shadow-2xl relative overflow-hidden group">
        <div className="absolute inset-0 bg-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />
        {elapsed}
      </div>
    </div>
  );
}

export default function LiveControlPage() {
  const {
    matches,
    selectedMatch,
    setSelectedMatch,
    loading,
    actionLoading,
    userProfile,
    isOnline,
    startMatch,
    finishMatch,
    registerGoal,
    registerCard,
    registerSubstitution,
    pauseMatch,
    resumeMatch,
    registerObservation,
    updatePeriod,
    updateStoppage
  } = useLiveControl();

  const [observationText, setObservationText] = useState('');

  const [playersA, setPlayersA] = useState<any[]>([]);
  const [playersB, setPlayersB] = useState<any[]>([]);
  const [loadingPlayers, setLoadingPlayers] = useState(false);

  const isLocked = selectedMatch?.summaryLocked;
  const isAdmin = userProfile?.role === 'ADMIN' || userProfile?.role === 'SUPER_ADMIN';
  const canOperate = !isLocked || isAdmin;

  // Review Modal State
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [matchEvents, setMatchEvents] = useState<any[]>([]);
  const [confirmedReview, setConfirmReview] = useState(false);

  // Subscrição em Tempo Real para os Eventos
  useEffect(() => {
    if (!selectedMatch?.id) {
      setMatchEvents([]);
      return;
    }

    const unsubscribe = MatchService.subscribeToMatchEvents(selectedMatch.id, (events) => {
      setMatchEvents(events);
    });

    return () => unsubscribe();
  }, [selectedMatch?.id]);

  useEffect(() => {
    async function fetchPlayers() {
      if (!selectedMatch) return;
      setLoadingPlayers(true);
      try {
        const qA = query(collection(db, 'atletas'), where('teamId', '==', selectedMatch.teamAId));
        const qB = query(collection(db, 'atletas'), where('teamId', '==', selectedMatch.teamBId));

        const [snapA, snapB] = await Promise.all([getDocs(qA), getDocs(qB)]);

        setPlayersA(snapA.docs.map(d => ({ id: d.id, name: d.data().fullName, number: d.data().number })));
        setPlayersB(snapB.docs.map(d => ({ id: d.id, name: d.data().fullName, number: d.data().number })));
      } catch (error) {
        console.error("Erro ao buscar jogadores:", error);
      } finally {
        setLoadingPlayers(false);
      }
    }

    fetchPlayers();
  }, [selectedMatch?.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-4 max-w-4xl mx-auto space-y-6 pb-20">
      <header className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-2xl shadow-sm border gap-4">
        <div className="flex items-center gap-4">
          <div className="relative">
             <Trophy className="h-10 w-10 text-amber-500" />
             {!isOnline && (
                <Badge className="absolute -top-2 -right-2 bg-red-600 text-white text-[8px] px-1.5 py-0.5 animate-pulse border-2 border-white">
                  OFFLINE
                </Badge>
             )}
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
              Modo Árbitro
            </h1>
            <div className="flex items-center gap-2">
               <p className="text-sm text-slate-500 font-medium tracking-tight">Painel de controle em tempo real</p>
               {!isOnline && (
                 <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50 text-[10px] font-black uppercase tracking-widest">
                    Modo Offline Ativado
                 </Badge>
               )}
            </div>
          </div>
        </div>
        <div className="w-full md:w-80">
          <Select
            onValueChange={(id) => setSelectedMatch(matches.find(m => m.id === id) || null)}
            value={selectedMatch?.id || ""}
          >
            <SelectTrigger className="rounded-xl border-2 border-slate-100 h-12">
              <SelectValue placeholder="Escolher Partida Ativa" />
            </SelectTrigger>
            <SelectContent>
              {matches.map(match => (
                <SelectItem key={match.id} value={match.id}>
                  {match.teamAName} vs {match.teamBName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </header>

      {!selectedMatch ? (
        <div className="text-center py-32 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
          <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
             <Trophy className="w-10 h-10 text-slate-200" />
          </div>
          <p className="text-slate-400 font-bold text-lg">Selecione uma partida para operar o placar</p>
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Dashboard de Placar (Sticky no Mobile) */}
          <Card className="sticky top-16 z-30 overflow-hidden border-none shadow-2xl bg-gradient-to-br from-[#0B0C0E] to-[#1A1C1E] text-white rounded-[2.5rem] border-b-4 border-red-600">
            <CardContent className="p-6 md:p-10">
              <div className="flex justify-between items-center text-center gap-2">
                <div className="flex-1 space-y-2">
                  <div className="w-14 h-14 md:w-20 md:h-20 bg-white rounded-2xl mx-auto flex items-center justify-center text-3xl font-black text-black shadow-lg italic">
                    {selectedMatch.teamAName[0]}
                  </div>
                  <h3 className="font-black text-xs md:text-xl tracking-tighter uppercase italic">{selectedMatch.teamAName}</h3>
                </div>

                <div className="flex-2 px-2">
                  <div className="text-5xl md:text-7xl font-black tabular-nums tracking-tighter drop-shadow-[0_0_20px_rgba(220,38,38,0.3)] flex items-center gap-2 md:gap-4">
                    <span>{selectedMatch.scoreA}</span>
                    <span className="text-xl md:text-2xl text-white/20 font-light">-</span>
                    <span>{selectedMatch.scoreB}</span>
                  </div>
                  <Badge className={`mt-2 uppercase tracking-widest px-4 py-1 font-black text-[8px] rounded-full ${selectedMatch.status === 'LIVE' ? 'bg-red-600 animate-pulse' : 'bg-white/10'}`}>
                    {selectedMatch.status === 'LIVE' ? '• AO VIVO' : 'AGUARDANDO'}
                  </Badge>
                </div>

                <div className="flex-1 space-y-2">
                  <div className="w-14 h-14 md:w-20 md:h-20 bg-white rounded-2xl mx-auto flex items-center justify-center text-3xl font-black text-black shadow-lg italic">
                    {selectedMatch.teamBName[0]}
                  </div>
                  <h3 className="font-black text-xs md:text-xl tracking-tighter uppercase italic">{selectedMatch.teamBName}</h3>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Controles Principais */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="rounded-2xl border-2 overflow-hidden">
              <CardContent className="p-0">
                <div className="bg-slate-50 p-4 border-b flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-500 font-bold text-xs uppercase tracking-widest">
                    <Clock className="w-4 h-4" /> Cronômetro de Jogo
                  </div>
                  {selectedMatch.status === 'LIVE' && selectedMatch.currentPeriod !== 'INTERVALO' && selectedMatch.currentPeriod !== 'FIM' ? (
                    <div className="flex items-center gap-2">
                       <div className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
                       <span className="text-[10px] font-black text-red-600 uppercase">Em Andamento</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                       <span className="text-[10px] font-black text-slate-400 uppercase">
                          {selectedMatch.status === 'FINISHED' ? 'Partida Encerrada' : 'Cronômetro Parado'}
                       </span>
                    </div>
                  )}
                </div>

                <div className="p-8 flex flex-col items-center justify-center gap-8">
                  <MatchTimer
                    startTime={selectedMatch.actualStartTime}
                    status={selectedMatch.status}
                    period={selectedMatch.currentPeriod}
                    stoppage={selectedMatch.stoppageTime}
                  />

                  {/* Controles de Período e Acréscimos */}
                  <div className="w-full space-y-4 pt-4 border-t border-slate-100">
                    <div className="flex flex-col gap-2">
                       <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">Alterar Período</label>
                       <div className="grid grid-cols-4 gap-2">
                          {(['1T', 'INTERVALO', '2T', 'FIM'] as const).map((p) => (
                             <Button
                                key={p}
                                size="sm"
                                variant={selectedMatch.currentPeriod === p ? 'default' : 'outline'}
                                className={cn(
                                   "h-10 font-black text-[10px] rounded-lg border-2",
                                   selectedMatch.currentPeriod === p ? "bg-blue-600 border-blue-600" : "border-slate-100 text-slate-500"
                                )}
                                onClick={() => updatePeriod(p)}
                             >
                                {p}
                             </Button>
                          ))}
                       </div>
                    </div>

                    <div className="flex flex-col gap-2">
                       <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">Definir Acréscimos (Minutos)</label>
                       <div className="flex items-center justify-center gap-4">
                          {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(min => (
                             <button
                                key={min}
                                onClick={() => updateStoppage(min)}
                                className={cn(
                                   "w-8 h-8 rounded-full font-black text-xs transition-all",
                                   selectedMatch.stoppageTime === min
                                   ? "bg-red-600 text-white scale-110 shadow-lg"
                                   : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                                )}
                             >
                                +{min}
                             </button>
                          ))}
                       </div>
                    </div>
                  </div>

                  <div className="flex w-full gap-3 pt-4">
                    {selectedMatch.status === 'SCHEDULED' && (
                      <Button
                        className="w-full h-14 text-lg font-black bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-lg shadow-emerald-100"
                        onClick={startMatch}
                        disabled={actionLoading}
                      >
                        INICIAR PARTIDA
                      </Button>
                    )}
                    {selectedMatch.status === 'LIVE' && (
                      <div className="flex flex-col w-full gap-3">
                        <div className="flex gap-3">
                           <Button
                              className="flex-1 h-14 font-black bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-lg"
                              onClick={(selectedMatch as any).isPaused ? resumeMatch : pauseMatch}
                              disabled={actionLoading}
                           >
                              {(selectedMatch as any).isPaused ? <><Play className="mr-2 h-4 w-4 fill-current" /> RETOMAR</> : <><Pause className="mr-2 h-4 w-4" /> PAUSAR</>}
                           </Button>

                           <AlertDialog open={showReviewModal} onOpenChange={setShowReviewModal}>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="destructive"
                                  className="flex-1 h-14 text-lg font-black bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-lg shadow-red-100 flex items-center gap-2"
                                  disabled={actionLoading}
                                >
                                  <Square className="w-5 h-5 fill-current" />
                                  ENCERRAR
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="max-w-2xl rounded-[2.5rem] border-2 bg-[#0B0C0E] text-white">
                                <AlertDialogHeader>
                                  <div className="flex items-center gap-4 mb-4">
                                    <div className="w-14 h-14 bg-red-600/10 rounded-2xl flex items-center justify-center">
                                      <ClipboardCheck className="w-8 h-8 text-red-600" />
                                    </div>
                                    <div>
                                      <AlertDialogTitle className="text-2xl font-black italic uppercase tracking-tighter text-white">Revisão de Súmula</AlertDialogTitle>
                                      <AlertDialogDescription className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Protocolo Final de Encerramento</AlertDialogDescription>
                                    </div>
                                  </div>

                                  <div className="space-y-4">
                                     {/* Resumo do Placar */}
                                     <div className="bg-slate-900/50 p-6 rounded-3xl border border-white/5 flex items-center justify-between">
                                        <div className="text-center flex-1">
                                           <p className="text-[10px] font-black text-slate-500 uppercase mb-1 truncate">{selectedMatch.teamAName}</p>
                                           <span className="text-4xl font-black italic">{selectedMatch.scoreA}</span>
                                        </div>
                                        <div className="px-4 text-red-600 font-black italic text-xl">VS</div>
                                        <div className="text-center flex-1">
                                           <p className="text-[10px] font-black text-slate-500 uppercase mb-1 truncate">{selectedMatch.teamBName}</p>
                                           <span className="text-4xl font-black italic">{selectedMatch.scoreB}</span>
                                        </div>
                                     </div>

                                     {/* Timeline de Eventos Profissional */}
                                     <div className="max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                        <OfficialMatchSummary
                                          match={selectedMatch}
                                          events={matchEvents}
                                          isAdminView
                                        />
                                     </div>

                                     {/* Confirmação */}
                                     <div className="flex items-center space-x-3 p-4 bg-red-600/5 rounded-2xl border border-red-600/20 mt-4">
                                        <Checkbox
                                          id="confirm"
                                          checked={confirmedReview}
                                          onCheckedChange={(checked) => setConfirmReview(checked as boolean)}
                                          className="border-red-600 data-[state=checked]:bg-red-600"
                                        />
                                        <label htmlFor="confirm" className="text-xs font-bold text-slate-300 cursor-pointer">
                                           Confirmo que revisei a súmula e as informações estão corretas.
                                        </label>
                                     </div>
                                  </div>
                                </AlertDialogHeader>
                                <AlertDialogFooter className="gap-3 mt-6">
                                  <AlertDialogCancel className="h-12 rounded-xl font-black bg-slate-900 border-white/10 text-slate-400 hover:bg-slate-800 uppercase tracking-widest text-[10px]">CORRIGIR SÚMULA</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={finishMatch}
                                    disabled={!confirmedReview || actionLoading}
                                    className="h-12 rounded-xl font-black bg-red-600 hover:bg-red-700 shadow-lg shadow-red-900/20 uppercase tracking-widest text-[10px]"
                                  >
                                    FINALIZAR AGORA
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                           </AlertDialog>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-2 bg-white flex flex-col items-center justify-center p-6 text-center shadow-sm">
                 <div className="flex flex-col w-full gap-4">
                    {isLocked && !isAdmin ? (
                       <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-amber-700 font-bold text-xs uppercase flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4" /> Súmula bloqueada para edições.
                       </div>
                    ) : (
                       <>
                        <div className="flex items-center gap-3">
                           <Input
                              placeholder="Registrar observação oficial..."
                              value={observationText}
                              onChange={(e) => setObservationText(e.target.value)}
                              className="flex-1 h-12 rounded-xl border-slate-300 bg-slate-50 text-slate-900 placeholder:text-slate-500 font-medium"
                           />
                           <Button
                              className="bg-blue-600 hover:bg-blue-700 h-12 rounded-xl font-black px-6 text-white"
                              onClick={() => {
                                 if (!observationText.trim()) return;
                                 registerObservation(observationText);
                                 setObservationText('');
                              }}
                              disabled={actionLoading}
                           >
                              ENVIAR
                           </Button>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-600 uppercase tracking-widest px-2">
                           <FileText className="w-3 h-3 text-blue-600" /> Observações aparecem na súmula oficial
                        </div>
                       </>
                    )}
                 </div>
            </Card>
          </div>

          {/* Ações de Campo */}
          {selectedMatch.status === 'LIVE' && (
            <>
              <Tabs defaultValue="home" className="w-full">
                <TabsList className="grid w-full grid-cols-2 h-14 bg-slate-200 p-1.5 rounded-2xl mb-4">
                  <TabsTrigger value="home" className="rounded-xl font-black uppercase text-xs tracking-widest data-[state=active]:bg-slate-900 data-[state=active]:text-white data-[state=inactive]:text-slate-600">{selectedMatch.teamAName}</TabsTrigger>
                  <TabsTrigger value="away" className="rounded-xl font-black uppercase text-xs tracking-widest data-[state=active]:bg-slate-900 data-[state=active]:text-white data-[state=inactive]:text-slate-600">{selectedMatch.teamBName}</TabsTrigger>
                </TabsList>

                <TabsContent value="home">
                   <MatchActionPanel
                    team={{ id: selectedMatch.teamAId, name: selectedMatch.teamAName }}
                    players={playersA}
                    isTeamA={true}
                    onGoal={registerGoal}
                    onCard={registerCard}
                    loading={actionLoading || loadingPlayers || (isLocked && !isAdmin)}
                  />
                </TabsContent>
                <TabsContent value="away">
                  <MatchActionPanel
                    team={{ id: selectedMatch.teamBId, name: selectedMatch.teamBName }}
                    players={playersB}
                    isTeamA={false}
                    onGoal={registerGoal}
                    onCard={registerCard}
                    loading={actionLoading || loadingPlayers || (isLocked && !isAdmin)}
                  />
                </TabsContent>
              </Tabs>

              {/* SÚMULA OFICIAL EM TEMPO REAL NO MODO ÁRBITRO */}
              <div className="pt-6 border-t border-slate-100">
                <OfficialMatchSummary
                  match={selectedMatch}
                  events={matchEvents}
                  isAdminView
                />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function MatchActionPanel({ team, players, isTeamA, onGoal, onCard, loading }: any) {
  if (loading) {
    return (
      <div className="p-10 text-center text-slate-400">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
        <p className="text-xs font-bold uppercase">Carregando Elenco...</p>
      </div>
    );
  }

  return (
    <Card className="rounded-3xl border-2 border-slate-800 bg-[#0B0C0E]/50 overflow-hidden shadow-2xl">
      <CardContent className="p-0">
        <ScrollArea className="h-[500px]">
          <div className="p-4 space-y-4">
            {players.map((player: any) => (
              <div key={player.id} className="flex flex-col md:flex-row items-center justify-between p-5 bg-slate-900/80 rounded-[2rem] border border-white/5 hover:border-blue-500/30 transition-all shadow-xl gap-4">
                <div className="flex items-center gap-5 w-full md:w-auto">
                  <div className="bg-white text-black w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl shadow-lg italic">
                    {player.number}
                  </div>
                  <div>
                    <span className="font-black text-white text-lg block uppercase italic leading-tight">{player.name}</span>
                    <span className="text-[10px] text-blue-500 uppercase font-black tracking-widest">{team.name}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 w-full md:w-auto">
                  <Button
                    size="lg"
                    className="bg-emerald-600 hover:bg-emerald-500 font-black px-6 rounded-2xl h-16 shadow-lg shadow-emerald-900/20 active:scale-95 transition-transform"
                    onClick={() => onGoal(team.id, player, isTeamA)}
                    disabled={loading}
                  >
                    GOL
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="bg-yellow-400 hover:bg-yellow-300 text-black border-none h-16 rounded-2xl font-black text-xl active:scale-95 transition-transform"
                    onClick={() => onCard(team.id, player, 'YELLOW_CARD')}
                    disabled={loading}
                  >
                    🟨
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="bg-red-600 hover:bg-red-500 text-white border-none h-16 rounded-2xl font-black text-xl active:scale-95 transition-transform"
                    onClick={() => onCard(team.id, player, 'RED_CARD')}
                    disabled={loading}
                  >
                    🟥
                  </Button>
                </div>
              </div>
            ))}
            {players.length === 0 && (
               <div className="text-center py-20">
                 <Shirt className="w-12 h-12 text-slate-800 mx-auto mb-4" />
                 <p className="text-slate-500 text-xs font-black uppercase tracking-widest">Nenhum atleta vinculado.</p>
               </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
