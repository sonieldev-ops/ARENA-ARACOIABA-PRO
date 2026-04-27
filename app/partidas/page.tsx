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
          <div className="bg-zinc-900/30 border border-white/5 rounded-[2.5rem] overflow-hidden divide-y divide-white/5">
            {otherMatches.map(match => (
              <Link key={match.id} href={`/partida/${match.id}`} className="flex flex-col md:flex-row items-center justify-between p-8 hover:bg-white/5 transition-all group gap-6">
                <div className="flex items-center gap-12 flex-1 w-full justify-center md:justify-start">
                  <div className="flex items-center gap-4 w-48 justify-end">
                    <span className="font-black text-sm uppercase italic group-hover:text-[#FACC15] transition-colors">{match.teamAName}</span>
                    <div className="w-10 h-10 bg-zinc-800 rounded-xl border border-white/5 flex items-center justify-center font-bold text-xs text-zinc-600">
                        {match.teamAName?.substring(0, 2).toUpperCase()}
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-center">
                    <div className="text-2xl font-black italic bg-zinc-800/50 px-6 py-2 rounded-2xl group-hover:bg-[#FACC15] group-hover:text-black transition-all border border-white/5">
                      {match.scoreA} - {match.scoreB}
                    </div>
                    <Badge variant="outline" className="mt-2 border-zinc-800 text-[9px] font-black tracking-widest text-zinc-500">
                        {match.status === 'FINISHED' ? 'FINALIZADO' : 'AGENDADO'}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-4 w-48 justify-start">
                    <div className="w-10 h-10 bg-zinc-800 rounded-xl border border-white/5 flex items-center justify-center font-bold text-xs text-zinc-600">
                        {match.teamBName?.substring(0, 2).toUpperCase()}
                    </div>
                    <span className="font-black text-sm uppercase italic group-hover:text-[#FACC15] transition-colors">{match.teamBName}</span>
                  </div>
                </div>
                
                <div className="text-center md:text-right min-w-[150px] space-y-1">
                  <div className="text-[10px] font-black text-[#FACC15] uppercase tracking-widest flex items-center justify-center md:justify-end gap-1.5">
                    <Calendar className="w-3 h-3" />
                    {match.scheduledDate?.toDate().toLocaleDateString('pt-BR')}
                  </div>
                  <div className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest flex items-center justify-center md:justify-end gap-1.5">
                    <MapPin className="w-3 h-3" />
                    {match.location}
                  </div>
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
