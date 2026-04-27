'use client';

export const dynamic = 'force-static';
export const dynamicParams = true;

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { auth, db } from '@/src/lib/firebase/client';
import { doc, onSnapshot } from 'firebase/firestore';
import { Loader2, Trophy, Bell, BellOff, ArrowLeft, MapPin, Calendar, Timer } from 'lucide-react';
import { useFavorites } from '@/src/modules/users/hooks/useFavorites';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { sanitizeData } from '@/src/lib/utils';
import { Badge } from '@/components/ui/badge';
import { OfficialMatchSummary } from '@/src/modules/match/components/OfficialMatchSummary';
import { collection, query, where, orderBy, onSnapshot as onSnapshotQuery } from 'firebase/firestore';
import { WhiteLabelTheme } from '@/src/modules/shared/components/WhiteLabelTheme';

export default function PublicMatchPage() {
  const params = useParams();
  const router = useRouter();
  const matchId = params.matchId as string;
  const [match, setMatch] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const { isFavorite, toggleFavorite } = useFavorites();

  useEffect(() => {
    const unsubAuth = auth.onAuthStateChanged((u) => setUser(u));

    const unsubMatch = onSnapshot(doc(db, 'partidas', matchId), (doc) => {
      if (doc.exists()) {
        setMatch(sanitizeData({ id: doc.id, ...doc.data() }));
      }
      setLoading(false);
    });

    // Subscrição em Tempo Real para os Eventos (Súmula) - Usando nova estrutura de subcoleção
    const qEvents = query(
      collection(db, 'partidas', matchId, 'events'),
      orderBy('timestamp', 'asc')
    );

    const unsubEvents = onSnapshotQuery(qEvents, (snapshot) => {
      setEvents(snapshot.docs.map(doc => sanitizeData({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubAuth();
      unsubMatch();
      unsubEvents();
    };
  }, [matchId]);

  const handleFavoriteClick = async (teamId: string, teamName: string) => {
    if (!user) {
      toast.error("Faça login para seguir times e receber notificações");
      return;
    }
    try {
      await toggleFavorite(teamId);
      toast.success(isFavorite(teamId) ? `Você parou de seguir o ${teamName}` : `Seguindo ${teamName}! Você receberá alertas de gols.`);
    } catch (e) {
      toast.error("Erro ao atualizar favoritos");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0B0C0E] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-[#FACC15]" />
        <p className="text-zinc-500 font-black uppercase tracking-widest text-[10px]">Sincronizando Placar...</p>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0B0C0E] text-white gap-6 p-6 text-center">
        <div className="bg-zinc-900 p-8 rounded-full">
           <Trophy className="w-16 h-16 text-zinc-800" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black uppercase italic">Partida não encontrada</h2>
          <p className="text-zinc-500 text-sm">O link pode estar quebrado ou a partida foi removida.</p>
        </div>
        <Button onClick={() => router.push('/')} className="bg-[#FACC15] text-black font-black uppercase italic rounded-xl px-8 py-6">
          Voltar ao Início
        </Button>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#0B0C0E] text-white p-4 md:p-8 pb-32">
      <WhiteLabelTheme config={match} />
      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in zoom-in duration-500">
        
        {/* Header Navigation */}
        <div className="flex items-center justify-between border-b border-white/5 pb-6">
           <Button variant="ghost" onClick={() => router.back()} className="text-zinc-500 hover:text-white gap-2 font-black uppercase text-[10px] tracking-widest px-0">
             <ArrowLeft className="w-4 h-4" /> Voltar
           </Button>
           <span className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.3em]">{match.championshipName || 'ARENA PRO'}</span>
           <div className="w-16" /> {/* Spacer */}
        </div>

        {/* Placar Premium */}
        <div className="relative overflow-hidden bg-gradient-to-b from-zinc-900 to-black rounded-[3rem] p-8 md:p-12 border border-white/5 shadow-2xl">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-[#FACC15]/5 theme-shadow-primary blur-[100px] rounded-full pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
            
            {/* Team A */}
            <div className="flex flex-col items-center gap-6 flex-1 group">
              <div className="relative">
                <div className="w-24 h-24 md:w-32 md:h-32 bg-zinc-950 rounded-[2.5rem] flex items-center justify-center border-2 border-white/5 group-hover:border-[#FACC15]/30 group-hover:theme-border-primary transition-all">
                  <span className="text-3xl md:text-4xl font-black text-zinc-800 group-hover:text-[#FACC15] group-hover:theme-primary transition-colors">
                    {match.teamAName?.substring(0, 2).toUpperCase()}
                  </span>
                </div>
                <button 
                  onClick={() => handleFavoriteClick(match.teamAId, match.teamAName)}
                  className={`absolute -top-2 -right-2 p-3 rounded-2xl border transition-all ${
                    isFavorite(match.teamAId) 
                    ? 'bg-[#FACC15] border-[#FACC15] text-black scale-110 shadow-lg shadow-[#FACC15]/20 btn-custom-primary'
                    : 'bg-zinc-900 border-white/5 text-zinc-500 hover:text-white'
                  }`}
                >
                  {isFavorite(match.teamAId) ? <Bell className="w-4 h-4 fill-current" /> : <BellOff className="w-4 h-4" />}
                </button>
              </div>
              <h2 className="font-black text-xl md:text-2xl uppercase italic text-center leading-tight tracking-tighter">
                {match.teamAName}
              </h2>
            </div>

            {/* Score Center */}
            <div className="flex flex-col items-center gap-4">
              <div className="flex gap-2 mb-2">
                {match.currentPeriod && (
                   <Badge className="bg-blue-600 text-white border-none px-3 py-1 font-black text-[10px]">
                      {match.currentPeriod === '1T' ? '1º TEMPO' : match.currentPeriod === '2T' ? '2º TEMPO' : match.currentPeriod}
                   </Badge>
                )}
                {match.stoppageTime > 0 && (
                   <Badge className="bg-red-600 text-white border-none px-3 py-1 font-black text-[10px] animate-pulse">
                      +{match.stoppageTime} MIN
                   </Badge>
                )}
              </div>
              <div className="flex items-center gap-6">
                <span className="text-7xl md:text-8xl font-black italic tracking-tighter tabular-nums">{match.scoreA}</span>
                <span className="text-zinc-800 text-4xl font-black">:</span>
                <span className="text-7xl md:text-8xl font-black italic tracking-tighter tabular-nums">{match.scoreB}</span>
              </div>
              <Badge className={`px-6 py-2 font-black rounded-full text-[10px] tracking-[0.2em] border-none ${
                match.status === 'LIVE' ? 'bg-red-600 text-white animate-pulse' : 'bg-zinc-800 text-zinc-400'
              }`}>
                {match.status === 'LIVE' ? 'AO VIVO' : match.status === 'FINISHED' ? 'FINALIZADO' : 'AGENDADO'}
              </Badge>
            </div>

            {/* Team B */}
            <div className="flex flex-col items-center gap-6 flex-1 group">
              <div className="relative">
                <div className="w-24 h-24 md:w-32 md:h-32 bg-zinc-950 rounded-[2.5rem] flex items-center justify-center border-2 border-white/5 group-hover:border-[#FACC15]/30 group-hover:theme-border-primary transition-all">
                  <span className="text-3xl md:text-4xl font-black text-zinc-800 group-hover:text-[#FACC15] group-hover:theme-primary transition-colors">
                    {match.teamBName?.substring(0, 2).toUpperCase()}
                  </span>
                </div>
                <button 
                  onClick={() => handleFavoriteClick(match.teamBId, match.teamBName)}
                  className={`absolute -top-2 -right-2 p-3 rounded-2xl border transition-all ${
                    isFavorite(match.teamBId) 
                    ? 'bg-[#FACC15] border-[#FACC15] text-black scale-110 shadow-lg shadow-[#FACC15]/20 btn-custom-primary'
                    : 'bg-zinc-900 border-white/5 text-zinc-500 hover:text-white'
                  }`}
                >
                  {isFavorite(match.teamBId) ? <Bell className="w-4 h-4 fill-current" /> : <BellOff className="w-4 h-4" />}
                </button>
              </div>
              <h2 className="font-black text-xl md:text-2xl uppercase italic text-center leading-tight tracking-tighter">
                {match.teamBName}
              </h2>
            </div>

          </div>
        </div>

        {/* Match Info Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
           <div className="bg-zinc-900/30 border border-white/5 p-6 rounded-[2rem] flex flex-col items-center gap-2 text-center">
              <Calendar className="w-5 h-5 text-[#FACC15] theme-primary" />
              <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Data</span>
              <span className="font-black uppercase italic text-sm">{match.scheduledDate?.toDate().toLocaleDateString('pt-BR')}</span>
           </div>
           <div className="bg-zinc-900/30 border border-white/5 p-6 rounded-[2rem] flex flex-col items-center gap-2 text-center">
              <Timer className="w-5 h-5 text-[#FACC15] theme-primary" />
              <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Horário</span>
              <span className="font-black uppercase italic text-sm">{match.scheduledDate?.toDate().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
           </div>
           <div className="bg-zinc-900/30 border border-white/5 p-6 rounded-[2rem] flex flex-col items-center gap-2 text-center">
              <MapPin className="w-5 h-5 text-[#FACC15] theme-primary" />
              <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Local</span>
              <span className="font-black uppercase italic text-sm">{match.location || 'Não definido'}</span>
           </div>
        </div>

        {/* Súmula Oficial em Tempo Real */}
        <OfficialMatchSummary match={match} events={events} />

        {/* Notifications CTA */}
        {!user && (
          <div className="bg-[#FACC15] theme-bg-primary p-8 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl shadow-[#FACC15]/10 theme-shadow-primary">
            <div className="text-black btn-text-secondary text-center md:text-left">
              <h3 className="font-black text-2xl italic tracking-tighter uppercase leading-tight">NÃO PERCA NENHUM LANCE!</h3>
              <p className="text-sm font-bold opacity-70">Faça login e receba notificações de gols e fim de jogo no seu celular.</p>
            </div>
            <Button onClick={() => router.push('/login')} className="bg-black text-white hover:bg-zinc-800 font-black uppercase italic rounded-xl px-10 py-7 text-sm tracking-widest">
              ENTRAR AGORA
            </Button>
          </div>
        )}

      </div>
    </main>
  );
}
