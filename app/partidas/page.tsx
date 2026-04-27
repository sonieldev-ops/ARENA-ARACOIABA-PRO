'use client';

import { useEffect, useState } from 'react';
import { db } from '@/src/lib/firebase/client';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { Loader2, Calendar, Zap, Trophy, MapPin, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { sanitizeData } from '@/src/lib/utils';
import { Badge } from '@/components/ui/badge';
import { SponsorBanner } from '@/src/modules/sponsors/components/SponsorBanner';

export default function PublicMatchesPage() {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'partidas'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => sanitizeData({ id: doc.id, ...doc.data() }));
      
      // Ordenação manual por data agendada (descendente)
      data.sort((a, b) => {
        const dateA = a.scheduledDate?.toDate?.() || new Date(0);
        const dateB = b.scheduledDate?.toDate?.() || new Date(0);
        return dateB.getTime() - dateA.getTime();
      });

      setMatches(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0B0C0E] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-[#FACC15]" />
        <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Sincronizando Partidas...</p>
      </div>
    );
  }

  const liveMatches = matches.filter(m => m.status === 'LIVE');
  const otherMatches = matches.filter(m => m.status !== 'LIVE');

  return (
    <main className="min-h-screen bg-[#0B0C0E] text-white p-4 md:p-8 pb-32">
      <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in duration-700">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-l-4 border-[#FACC15] pl-6 py-2">
          <div>
            <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter leading-none">
              CENTRAL DE <span className="text-[#FACC15]">JOGOS</span>
            </h1>
            <p className="text-zinc-500 font-bold tracking-widest text-sm">ARENA ARACOIABA PRO • TEMPO REAL</p>
          </div>
          <Link href="/" className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors font-black uppercase text-[10px] tracking-widest">
            <ArrowLeft className="w-4 h-4" /> Voltar ao Início
          </Link>
        </div>

        <SponsorBanner position="home" />

        {/* AO VIVO */}
        {liveMatches.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center gap-3 text-[#FACC15]">
              <div className="w-2 h-2 bg-red-600 rounded-full animate-ping" />
              <Zap className="w-5 h-5 fill-current" />
              <h2 className="font-black uppercase tracking-[0.3em] text-sm italic">AO VIVO AGORA</h2>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              {liveMatches.map(match => (
                <Link key={match.id} href={`/partida/${match.id}`} className="group">
                  <div className="bg-zinc-900/80 backdrop-blur-sm border-2 border-[#FACC15] rounded-[2.5rem] p-8 transition-all hover:bg-zinc-900 shadow-2xl shadow-[#FACC15]/10">
                    <div className="flex items-center justify-between mb-6">
                      <span className="text-[10px] font-black bg-red-600 text-white px-3 py-1 rounded-full animate-pulse uppercase tracking-widest">AO VIVO</span>
                      <span className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">{match.championshipName}</span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex flex-col items-center gap-3 flex-1">
                        <div className="w-16 h-16 bg-zinc-800 rounded-2xl border border-white/5 flex items-center justify-center font-black text-xl text-zinc-600">
                          {match.teamAName?.substring(0, 2).toUpperCase()}
                        </div>
                        <span className="font-black text-xs text-center uppercase italic group-hover:text-[#FACC15] transition-colors">{match.teamAName}</span>
                      </div>
                      
                      <div className="flex flex-col items-center gap-1">
                         <div className="text-5xl font-black italic tracking-tighter tabular-nums flex items-center gap-3">
                            <span>{match.scoreA}</span>
                            <span className="text-zinc-700 text-2xl">:</span>
                            <span>{match.scoreB}</span>
                         </div>
                         <div className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Placar</div>
                      </div>

                      <div className="flex flex-col items-center gap-3 flex-1">
                        <div className="w-16 h-16 bg-zinc-800 rounded-2xl border border-white/5 flex items-center justify-center font-black text-xl text-zinc-600">
                          {match.teamBName?.substring(0, 2).toUpperCase()}
                        </div>
                        <span className="font-black text-xs text-center uppercase italic group-hover:text-[#FACC15] transition-colors">{match.teamBName}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* OUTRAS PARTIDAS */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 text-zinc-500">
            <Calendar className="w-5 h-5" />
            <h2 className="font-black uppercase tracking-[0.3em] text-sm italic">PRÓXIMOS E ENCERRADOS</h2>
          </div>
          <div className="bg-zinc-900/40 border border-white/5 rounded-[2rem] overflow-hidden divide-y divide-white/5">
            {otherMatches.map(match => (
              <Link key={match.id} href={`/partida/${match.id}`} className="flex items-center justify-between p-4 md:p-6 hover:bg-[#FACC15]/5 transition-all group gap-4">
                {/* Time A */}
                <div className="flex flex-1 items-center justify-end gap-3">
                  <span className="font-black text-xs md:text-sm uppercase italic group-hover:text-[#FACC15] transition-colors truncate">
                    {match.teamAName}
                  </span>
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-zinc-800 rounded-full border border-white/10 flex-shrink-0 flex items-center justify-center font-bold text-[10px] text-zinc-400 group-hover:border-[#FACC15]/50">
                    {match.teamAName?.substring(0, 2).toUpperCase()}
                  </div>
                </div>

                {/* Placar Central */}
                <div className="flex flex-col items-center min-w-[80px] md:min-w-[120px]">
                  <div className="bg-zinc-950 px-4 py-2 md:px-6 md:py-2.5 rounded-xl border border-white/5 flex items-center gap-2 md:gap-3 group-hover:border-[#FACC15]/30">
                    <span className="text-lg md:text-2xl font-black italic tabular-nums">{match.scoreA}</span>
                    <span className="text-zinc-700 font-bold">-</span>
                    <span className="text-lg md:text-2xl font-black italic tabular-nums">{match.scoreB}</span>
                  </div>
                  <span className={cn(
                    "text-[8px] md:text-[9px] font-black tracking-[0.2em] mt-2 uppercase",
                    match.status === 'FINISHED' ? 'text-zinc-500' : 'text-[#FACC15]'
                  )}>
                    {match.status === 'FINISHED' ? 'Encerrado' : 'Agendado'}
                  </span>
                </div>

                {/* Time B */}
                <div className="flex flex-1 items-center justify-start gap-3">
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-zinc-800 rounded-full border border-white/10 flex-shrink-0 flex items-center justify-center font-bold text-[10px] text-zinc-400 group-hover:border-[#FACC15]/50">
                    {match.teamBName?.substring(0, 2).toUpperCase()}
                  </div>
                  <span className="font-black text-xs md:text-sm uppercase italic group-hover:text-[#FACC15] transition-colors truncate">
                    {match.teamBName}
                  </span>
                </div>
                
                {/* Info Lateral (Data/Local) - Oculto em telas muito pequenas se necessário, ou empilhado */}
                <div className="hidden sm:flex flex-col items-end min-w-[100px] border-l border-white/5 pl-4 ml-2">
                  <span className="text-[9px] font-black text-[#FACC15]">{match.scheduledDate?.toDate().toLocaleDateString('pt-BR')}</span>
                  <span className="text-[8px] font-bold text-zinc-600 uppercase truncate max-w-[80px]">{match.location}</span>
                </div>
              </Link>
            ))}
            
            {otherMatches.length === 0 && (
              <div className="p-20 text-center text-zinc-600 font-black uppercase tracking-widest text-xs">
                 <Trophy className="w-12 h-12 mx-auto mb-4 opacity-10" />
                 Nenhum registro encontrado.
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
