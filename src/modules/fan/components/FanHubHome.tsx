'use client';

import { useEffect, useState } from 'react';
import { db } from '@/src/lib/firebase/client';
import {
  collection,
  query,
  onSnapshot,
  where,
  orderBy,
  limit,
  doc,
  setDoc,
  deleteDoc
} from 'firebase/firestore';
import { 
  Trophy, 
  Calendar, 
  Zap, 
  ChevronRight,
  Target,
  Activity,
  Bell,
  Star,
  Share2,
  Play,
  Info,
  Clock,
  MapPin,
  TrendingUp,
  Megaphone,
  Users,
  User as UserIcon,
  Shield
} from 'lucide-react';
import Link from 'next/link';
import { sanitizeData, formatFirebaseDate, cn } from '@/src/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/src/modules/auth/context/AuthContext';
import { useFavorites } from '@/src/modules/users/hooks/useFavorites';
import { toast } from 'sonner';
import { FavoriteButton } from './FavoriteButton';

export function FanHubHome() {
  const { user } = useAuth();
  const { favorites, toggleFavorite, isFavorite } = useFavorites();
  const [activeChampionships, setActiveChampionships] = useState<any[]>([]);
  const [liveMatches, setLiveMatches] = useState<any[]>([]);
  const [upcomingMatches, setUpcomingMatches] = useState<any[]>([]);
  const [standings, setStandings] = useState<any[]>([]);
  const [scorers, setScorers] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [sponsors, setSponsors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);

  useEffect(() => {
    // 1. Campeonatos Ativos
    const qChamps = query(collection(db, 'campeonatos'), where('status', 'in', ['ACTIVE', 'OPEN', 'SCHEDULED']));
    const unsubChamps = onSnapshot(qChamps, (snap) => {
      setActiveChampionships(snap.docs.map(doc => sanitizeData({ id: doc.id, ...doc.data() })));
    });

    // 2. Jogos Ao Vivo
    const qLive = query(collection(db, 'partidas'), where('status', '==', 'LIVE'));
    const unsubLive = onSnapshot(qLive, (snap) => {
      setLiveMatches(snap.docs.map(doc => sanitizeData({ id: doc.id, ...doc.data() })));
    });

    // 3. Próximos Jogos
    const qUpcoming = query(
      collection(db, 'partidas'),
      where('status', '==', 'SCHEDULED'),
      orderBy('scheduledDate', 'asc'),
      limit(10)
    );
    const unsubUpcoming = onSnapshot(qUpcoming, (snap) => {
      setUpcomingMatches(snap.docs.map(doc => sanitizeData({ id: doc.id, ...doc.data() })));
    });

    // 4. Classificação (Geral ou do primeiro campeonato ativo)
    const qStandings = query(collection(db, 'classificacoes'), orderBy('points', 'desc'), limit(10));
    const unsubStandings = onSnapshot(qStandings, (snap) => {
      const data = snap.docs.map(doc => sanitizeData({ id: doc.id, ...doc.data() }));
      // Ordenação manual similar ao admin para consistência
      data.sort((a: any, b: any) => {
        if ((b.points || 0) !== (a.points || 0)) return (b.points || 0) - (a.points || 0);
        if ((b.victories || 0) !== (a.victories || 0)) return (b.victories || 0) - (a.victories || 0);
        return (b.goalDifference || 0) - (a.goalDifference || 0);
      });
      setStandings(data);
    });

    // 5. Artilharia
    const qScorers = query(collection(db, 'atletas'), where('goals', '>', 0), orderBy('goals', 'desc'), limit(5));
    const unsubScorers = onSnapshot(qScorers, (snap) => {
      setScorers(snap.docs.map(doc => sanitizeData({ id: doc.id, ...doc.data() })));
    });

    // 6. Avisos
    const qAnnouncements = query(collection(db, 'announcements'), orderBy('createdAt', 'desc'), limit(3));
    const unsubAnnouncements = onSnapshot(qAnnouncements, (snap) => {
      setAnnouncements(snap.docs.map(doc => sanitizeData({ id: doc.id, ...doc.data() })));
    });

    // 7. Patrocinadores
    const qSponsors = query(collection(db, 'sponsors'), where('active', '==', true));
    const unsubSponsors = onSnapshot(qSponsors, (snap) => {
      setSponsors(snap.docs.map(doc => sanitizeData({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    return () => {
      unsubChamps(); unsubLive(); unsubUpcoming(); unsubStandings(); unsubScorers(); unsubAnnouncements(); unsubSponsors();
    };
  }, []);

  const handleToggleFavorite = async (teamId: string, teamName: string) => {
    try {
      await toggleFavorite(teamId);
      toast.success(isFavorite(teamId) ? `${teamName} removido` : `${teamName} favoritado!`);
    } catch (e) {
      toast.error("Faça login para favoritar times");
    }
  };

  const shareChampionship = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Arena Araçoiaba Pro',
        text: 'Acompanhe o campeonato na Arena Araçoiaba!',
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copiado!");
    }
  };

  if (loading) {
    return <LoadingSkeleton />;
  }

  const filteredLive = showOnlyFavorites
    ? liveMatches.filter(m => favorites.includes(m.teamAId) || favorites.includes(m.teamBId))
    : liveMatches;

  const filteredUpcoming = showOnlyFavorites
    ? upcomingMatches.filter(m => favorites.includes(m.teamAId) || favorites.includes(m.teamBId))
    : upcomingMatches;

  return (
    <div className="min-h-screen bg-[#05070A] text-white pb-24 font-sans">
      {/* Premium Header */}
      <header className="sticky top-0 z-50 bg-[#05070A]/90 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-red-600 p-1.5 rounded-lg">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col -space-y-1">
              <span className="text-lg font-black tracking-tighter italic uppercase">
                ARENA <span className="text-red-600">PRO</span>
              </span>
              <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-[0.2em]">Araçoiaba da Serra</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {user ? (
              <div className="flex items-center gap-2">
                {(user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') && (
                  <Button asChild variant="outline" size="sm" className="rounded-full h-8 px-4 border-blue-500/30 text-blue-400 hover:bg-blue-500/10 hidden md:flex items-center gap-2">
                    <Link href="/admin/dashboard">
                      <Shield className="w-3 h-3" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Painel Pro</span>
                    </Link>
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
                  className={cn(
                    "rounded-full h-8 px-4 text-[10px] font-black uppercase tracking-widest transition-all",
                    showOnlyFavorites ? "bg-red-600 border-red-600 text-white" : "bg-white/5 border-white/10 text-zinc-400"
                  )}
                >
                  {showOnlyFavorites ? "Ver Tudo" : "Meus Times"}
                </Button>
              </div>
            ) : (
              <Button asChild variant="ghost" size="sm" className="rounded-full h-8 px-4 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white hover:bg-white/5">
                <Link href="/login" className="flex items-center gap-2">
                  <UserIcon className="w-3 h-3" />
                  Entrar
                </Link>
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={shareChampionship} className="rounded-full hover:bg-white/5">
              <Share2 className="w-5 h-5 text-zinc-400" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-8">
        
        {/* Featured Championship Hero */}
        {activeChampionships.length > 0 && !showOnlyFavorites && (
          <section className="relative rounded-[2rem] overflow-hidden bg-zinc-900 border border-white/5 aspect-[16/9] md:aspect-[21/7]">
             <div className="absolute inset-0 bg-gradient-to-t from-[#05070A] via-[#05070A]/40 to-transparent z-10" />
             <div className="absolute inset-0 bg-gradient-to-r from-[#05070A] via-transparent to-transparent z-10" />

             {/* Fake Hero Image/Pattern */}
             <div className="absolute inset-0 opacity-30 grayscale mix-blend-overlay bg-[url('https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80')] bg-cover bg-center" />

             <div className="absolute inset-0 z-20 p-6 md:p-12 flex flex-col justify-end items-start space-y-4">
                <Badge className="bg-red-600 text-white border-none px-3 py-1 text-[10px] font-black uppercase tracking-widest">
                  DESTAQUE
                </Badge>
                <h1 className="text-4xl md:text-6xl font-black italic uppercase leading-[0.9] tracking-tighter max-w-2xl">
                  {activeChampionships[0].name}
                </h1>
                <div className="flex items-center gap-4 text-zinc-400 font-bold text-xs uppercase tracking-widest">
                  <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {activeChampionships[0].season || '2026'}</span>
                  <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> {activeChampionships[0].category || 'Principal'}</span>
                </div>
                <div className="flex gap-3 pt-2">
                   <Button asChild className="bg-white text-black hover:bg-zinc-200 rounded-xl font-black uppercase text-[10px] tracking-widest h-11 px-6">
                      <Link href={`/classificacao/${activeChampionships[0].id}`}>Ver Detalhes</Link>
                   </Button>
                </div>
             </div>
          </section>
        )}

        {/* Live Matches Slider/Grid */}
        {filteredLive.length > 0 && (
          <section className="space-y-4">
            <SectionHeader title="Ao Vivo" icon={<Zap className="w-4 h-4 fill-emerald-500 text-emerald-500" />} color="emerald" />
            <div className="grid gap-4 md:grid-cols-2">
              {filteredLive.map((match) => (
                <LiveMatchCard
                  key={match.id}
                  match={match}
                  onFavorite={handleToggleFavorite}
                  isFavoriteA={favorites.includes(match.teamAId)}
                  isFavoriteB={favorites.includes(match.teamBId)}
                />
              ))}
            </div>
          </section>
        )}

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content (Left/Center) */}
          <div className="lg:col-span-2 space-y-8">

            {/* Announcements */}
            {announcements.length > 0 && !showOnlyFavorites && (
              <section className="space-y-4">
                <SectionHeader title="Avisos Oficiais" icon={<Megaphone className="w-4 h-4" />} />
                <div className="space-y-3">
                  {announcements.map((item) => (
                    <Card key={item.id} className="bg-zinc-900/50 border-white/5 overflow-hidden">
                      <CardContent className="p-4 flex gap-4">
                        <div className="bg-red-600/10 text-red-500 p-2 h-fit rounded-lg">
                          <Info className="w-5 h-5" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-black text-sm uppercase tracking-tight text-white">{item.title}</h4>
                          <p className="text-zinc-400 text-xs leading-relaxed">{item.content || item.message}</p>
                          <span className="text-[10px] text-zinc-600 font-bold uppercase">{formatFirebaseDate(item.createdAt)}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {/* Upcoming Matches */}
            <section className="space-y-4">
              <SectionHeader title={showOnlyFavorites ? "Meus Próximos Jogos" : "Próximos Jogos"} icon={<Calendar className="w-4 h-4" />} />
              <div className="space-y-3">
                {filteredUpcoming.length > 0 ? filteredUpcoming.map((match) => (
                  <UpcomingMatchRow
                    key={match.id}
                    match={match}
                    onFavorite={handleToggleFavorite}
                    isFavoriteA={favorites.includes(match.teamAId)}
                    isFavoriteB={favorites.includes(match.teamBId)}
                  />
                )) : (
                  <EmptyState
                    message={showOnlyFavorites ? "Nenhum jogo dos seus times favoritos agendado." : "Nenhuma partida agendada no momento."}
                    icon={showOnlyFavorites ? <Star className="w-12 h-12" /> : <Calendar className="w-12 h-12" />}
                  />
                )}
                {!showOnlyFavorites && upcomingMatches.length > 0 && (
                  <Button variant="outline" className="w-full border-white/5 bg-zinc-900/50 text-zinc-400 font-bold text-[10px] uppercase tracking-widest h-12 rounded-xl">
                    Ver Calendário Completo
                  </Button>
                )}
              </div>
            </section>
          </div>

          {/* Sidebar (Right) */}
          {!showOnlyFavorites && (
            <div className="space-y-8">
              {/* Standings Mini */}
              <section className="space-y-4">
                <SectionHeader title="Classificação" icon={<TrendingUp className="w-4 h-4" />} />
                <div className="bg-zinc-900/50 border border-white/5 rounded-2xl overflow-hidden">
                  <table className="w-full text-xs">
                    <thead className="bg-white/5 text-zinc-500 font-black uppercase text-[9px] tracking-widest">
                      <tr>
                        <th className="px-4 py-3 text-left">Pos</th>
                        <th className="py-3 text-left">Time</th>
                        <th className="py-3 text-center">P</th>
                        <th className="py-3 text-center">J</th>
                        <th className="px-4 py-3 text-center">SG</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {standings.length > 0 ? standings.map((item, idx) => (
                        <tr key={item.id} className={cn("hover:bg-white/5 transition-colors", idx < 4 && "bg-emerald-500/5")}>
                          <td className="px-4 py-3 font-black italic text-zinc-500">
                            <span className={cn(idx < 4 && "text-emerald-500")}>{idx + 1}º</span>
                          </td>
                          <td className="py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-5 h-5 bg-zinc-800 rounded-sm flex items-center justify-center text-[8px] font-black">{item.name?.substring(0,2)}</div>
                              <span className="font-bold uppercase text-[10px] truncate max-w-[80px]">{item.name}</span>
                            </div>
                          </td>
                          <td className="py-3 text-center font-black">{item.points}</td>
                          <td className="py-3 text-center text-zinc-500">{item.played || 0}</td>
                          <td className="px-4 py-3 text-center text-zinc-500">{item.goalDifference || 0}</td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={5} className="p-0">
                             <div className="py-12 flex flex-col items-center justify-center gap-3 bg-zinc-950/30">
                                <Trophy className="w-8 h-8 text-zinc-800" />
                                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-600 text-center max-w-[150px]">Aguardando início das competições</p>
                             </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Top Scorers */}
              <section className="space-y-4">
                <SectionHeader title="Artilharia" icon={<Target className="w-4 h-4 text-red-600" />} />
                <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4 space-y-4">
                  {scorers.length > 0 ? scorers.map((scorer, idx) => (
                    <div key={scorer.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-xl font-black italic text-zinc-800">#{idx + 1}</span>
                        <div>
                          <p className="font-black text-xs uppercase italic leading-none">{scorer.fullName || scorer.name || scorer.athleteName}</p>
                          <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-tighter">{scorer.teamName}</p>
                        </div>
                      </div>
                      <div className="bg-white/5 px-3 py-1 rounded-lg border border-white/5">
                        <span className="text-sm font-black text-red-600">{scorer.goals}</span>
                      </div>
                    </div>
                  )) : (
                    <p className="text-center py-4 text-zinc-600 font-bold uppercase text-[10px] tracking-widest">Nenhum gol registrado</p>
                  )}
                </div>
              </section>
            </div>
          )}
        </div>


        {/* Sponsors */}
        {sponsors.length > 0 && (
          <section className="pt-12 border-t border-white/5 space-y-6">
            <span className="block text-center text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em]">Patrocinadores Oficiais</span>
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all">
              {sponsors.map((s) => (
                <a key={s.id} href={s.link || '#'} target="_blank" rel="noopener noreferrer">
                   <img src={s.logoUrl} alt={s.name} className="h-8 md:h-12 w-auto object-contain" />
                </a>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Floating Action Menu for Fans */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-sm">
        <div className="bg-zinc-950/80 backdrop-blur-2xl border border-white/10 rounded-full p-2 flex items-center justify-between shadow-2xl">
          <NavItem href="/" icon={<Trophy className="w-5 h-5" />} active />
          <NavItem href="/partidas" icon={<Calendar className="w-5 h-5" />} />
          <div className="relative">
             <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-600 rounded-full animate-ping" />
             <NavItem href="/live" icon={<Zap className="w-5 h-5" />} />
          </div>
          <NavItem href="/classificacao" icon={<Activity className="w-5 h-5" />} />
          {user && (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') ? (
            <NavItem href="/admin/dashboard" icon={<Shield className="w-5 h-5 text-blue-500" />} />
          ) : (
            <NavItem href="/profile" icon={<Star className="w-5 h-5" />} />
          )}
        </div>
      </nav>
    </div>
  );
}

function SectionHeader({ title, icon, color = "white" }: { title: string, icon?: React.ReactNode, color?: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        {icon}
        <h2 className={cn("text-sm font-black uppercase italic tracking-widest", color === "emerald" ? "text-emerald-500" : "text-white")}>
          {title}
        </h2>
      </div>
      <ChevronRight className="w-4 h-4 text-zinc-800" />
    </div>
  );
}

function LiveMatchCard({ match, onFavorite, isFavoriteA, isFavoriteB }: any) {
  return (
    <Card className="bg-zinc-900 border-emerald-500/20 rounded-[2rem] overflow-hidden group hover:border-emerald-500/50 transition-all shadow-xl shadow-emerald-500/5 relative">
      <div className="absolute top-0 right-0 p-4 flex gap-2 z-20">
         <FavoriteButton
            isFavorite={isFavoriteA}
            onClick={() => onFavorite(match.teamAId, match.teamAName)}
            size="sm"
         />
         <FavoriteButton
            isFavorite={isFavoriteB}
            onClick={() => onFavorite(match.teamBId, match.teamBName)}
            size="sm"
         />
      </div>

      <CardContent className="p-6">
        <div className="flex items-center justify-center mb-6">
           <Badge className="bg-red-600 text-white border-none px-4 py-1 font-black text-[10px] tracking-[0.2em] animate-pulse">
             AO VIVO • {match.currentPeriod || 'EM JOGO'}
           </Badge>
        </div>

        <div className="flex items-center justify-between gap-4">
           <TeamMini teamName={match.teamAName} score={match.scoreA} isFav={isFavoriteA} />
           <div className="flex flex-col items-center gap-2">
              <span className="text-xl font-black italic text-zinc-800">VS</span>
              {match.liveStreamUrl && (
                <Button asChild size="sm" className="bg-emerald-600 text-white hover:bg-emerald-700 rounded-full h-8 px-6 text-[9px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-emerald-900/20">
                  <a href={match.liveStreamUrl} target="_blank" rel="noopener noreferrer">
                    <Play className="w-3 h-3 fill-current" /> ASSISTIR
                  </a>
                </Button>
              )}
           </div>
           <TeamMini teamName={match.teamBName} score={match.scoreB} reverse isFav={isFavoriteB} />
        </div>

        <div className="mt-6 flex justify-center">
           <Button asChild variant="ghost" className="text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white">
              <Link href={`/partida/${match.id}`}>Ver Detalhes da Partida</Link>
           </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function TeamMini({ teamName, score, reverse, isFav }: any) {
  return (
    <div className={cn("flex items-center gap-4 flex-1", reverse && "flex-row-reverse")}>
       <div className={cn(
         "w-12 h-12 bg-white rounded-2xl flex items-center justify-center border-4 font-black text-xl transition-all",
         isFav ? "border-red-600 scale-110 shadow-lg shadow-red-900/20" : "border-zinc-800 text-black"
       )}>
         {teamName?.substring(0,1)}
       </div>
       <div className={cn("flex flex-col", reverse ? "items-end" : "items-start")}>
         <span className={cn("text-4xl font-black italic tracking-tighter tabular-nums", isFav ? "text-red-500" : "text-white")}>{score}</span>
         <span className="text-[10px] font-bold uppercase truncate max-w-[60px] text-zinc-500 tracking-tighter">{teamName}</span>
       </div>
    </div>
  );
}

function UpcomingMatchRow({ match, onFavorite, isFavoriteA, isFavoriteB }: any) {
  const dateStr = formatFirebaseDate(match.scheduledDate);
  const dateParts = dateStr.split(' ');
  const dayMonth = dateParts[0] ? dateParts[0].substring(0, 5) : '--/--';
  const time = dateParts[1] || '--:--';

  return (
    <div className="flex items-center gap-4 p-4 bg-zinc-900/50 border border-white/5 rounded-2xl hover:border-white/10 transition-colors group relative">
      <div className="flex flex-col items-center justify-center bg-white/5 rounded-xl min-w-[60px] py-2 group-hover:bg-red-600/10 transition-colors">
        <span className="text-[10px] font-black uppercase text-zinc-500 group-hover:text-red-500">{dayMonth}</span>
        <span className="text-sm font-black italic text-white">{time}</span>
      </div>

      <div className="flex-1 grid grid-cols-2 items-center gap-4 px-2">
        <div className="flex items-center justify-end gap-2">
           <span className={cn("text-[10px] font-black uppercase truncate", isFavoriteA && "text-red-500")}>{match.teamAName}</span>
           <FavoriteButton
              isFavorite={isFavoriteA}
              onClick={() => onFavorite(match.teamAId, match.teamAName)}
              size="sm"
              className="bg-transparent border-none w-auto h-auto hover:bg-transparent"
           />
        </div>
        <div className="flex items-center justify-start gap-2">
           <FavoriteButton
              isFavorite={isFavoriteB}
              onClick={() => onFavorite(match.teamBId, match.teamBName)}
              size="sm"
              className="bg-transparent border-none w-auto h-auto hover:bg-transparent"
           />
           <span className={cn("text-[10px] font-black uppercase truncate", isFavoriteB && "text-red-500")}>{match.teamBName}</span>
        </div>
      </div>

      <div className="flex flex-col items-end gap-1 min-w-[80px]">
        <div className="flex items-center gap-1 text-zinc-500">
           <MapPin className="w-3 h-3" />
           <span className="text-[8px] font-bold uppercase truncate max-w-[60px]">{match.location || 'Arena Pro'}</span>
        </div>
        <Link href={`/partida/${match.id}`} className="text-[8px] font-black uppercase text-red-600 hover:underline">
          Lances
        </Link>
      </div>
    </div>
  );
}

function NavItem({ href, icon, active = false }: { href: string, icon: React.ReactNode, active?: boolean }) {
  return (
    <Link href={href} className={cn(
      "w-12 h-12 rounded-full flex items-center justify-center transition-all",
      active ? "bg-red-600 text-white shadow-lg shadow-red-600/20" : "text-zinc-500 hover:text-white"
    )}>
      {icon}
    </Link>
  );
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-[#05070A] p-6 space-y-8 animate-pulse">
      <div className="h-12 w-48 bg-zinc-900 rounded-full" />
      <div className="aspect-[16/9] w-full bg-zinc-900 rounded-[2rem]" />
      <div className="grid gap-4 md:grid-cols-2">
        <div className="h-40 bg-zinc-900 rounded-[2rem]" />
        <div className="h-40 bg-zinc-900 rounded-[2rem]" />
      </div>
    </div>
  );
}

function EmptyState({ message, icon }: { message: string, icon?: React.ReactNode }) {
  return (
    <div className="py-20 bg-zinc-900/30 rounded-[2rem] border-2 border-dashed border-white/5 flex flex-col items-center justify-center text-zinc-600 gap-4">
       <div className="opacity-20">{icon || <Trophy className="w-12 h-12" />}</div>
       <p className="text-xs font-black uppercase tracking-widest max-w-[200px] text-center leading-relaxed">{message}</p>
    </div>
  );
}

