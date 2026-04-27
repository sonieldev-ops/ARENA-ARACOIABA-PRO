'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase/client';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { Loader2, Calendar, Trophy, Zap } from 'lucide-react';
import Link from 'next/link';

export default function PublicMatchesPage() {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'matches'),
      orderBy('date', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMatches(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0B0C0E]">
        <Loader2 className="w-10 h-10 animate-spin text-[#FACC15]" />
      </div>
    );
  }

  const liveMatches = matches.filter(m => m.status === 'LIVE');
  const finishedMatches = matches.filter(m => m.status === 'FINISHED');

  return (
    <main className="min-h-screen bg-[#0B0C0E] text-white p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-12">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-black italic uppercase tracking-tighter">
            CENTRAL DE <span className="text-[#FACC15]">JOGOS</span>
          </h1>
          <p className="text-zinc-500 font-bold">ACOMPANHE TUDO EM TEMPO REAL</p>
        </div>

        {/* AO VIVO */}
        {liveMatches.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-[#FACC15]">
              <Zap className="w-5 h-5 fill-current animate-pulse" />
              <h2 className="font-black uppercase tracking-widest text-sm">AO VIVO AGORA</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {liveMatches.map(match => (
                <Link key={match.id} href={`/match/${match.id}`}>
                  <div className="bg-zinc-900 border-2 border-[#FACC15] rounded-3xl p-6 hover:scale-[1.02] transition-transform">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[10px] font-black bg-[#FACC15] text-black px-2 py-0.5 rounded-full">LIVE</span>
                      <span className="text-zinc-500 text-xs font-bold">{match.category}</span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex flex-col items-center gap-2 flex-1">
                        <div className="w-12 h-12 bg-zinc-800 rounded-full border border-white/10" />
                        <span className="font-bold text-xs text-center line-clamp-1">{match.homeTeamName}</span>
                      </div>
                      <div className="text-3xl font-black italic">{match.homeScore} : {match.awayScore}</div>
                      <div className="flex flex-col items-center gap-2 flex-1">
                        <div className="w-12 h-12 bg-zinc-800 rounded-full border border-white/10" />
                        <span className="font-bold text-xs text-center line-clamp-1">{match.awayTeamName}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ENCERRADOS / PRÓXIMOS */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-zinc-400">
            <Calendar className="w-5 h-5" />
            <h2 className="font-black uppercase tracking-widest text-sm">ÚLTIMAS PARTIDAS</h2>
          </div>
          <div className="bg-zinc-900/50 border border-white/5 rounded-3xl divide-y divide-white/5">
            {finishedMatches.map(match => (
              <Link key={match.id} href={`/match/${match.id}`} className="flex items-center justify-between p-6 hover:bg-white/5 transition-colors group">
                <div className="flex items-center gap-8 flex-1">
                  <div className="flex items-center gap-3 w-40">
                    <div className="w-8 h-8 bg-zinc-800 rounded-full border border-white/10" />
                    <span className="font-bold text-sm truncate">{match.homeTeamName}</span>
                  </div>
                  <div className="text-xl font-black italic bg-zinc-800 px-4 py-1 rounded-lg group-hover:bg-[#FACC15] group-hover:text-black transition-colors">
                    {match.homeScore} - {match.awayScore}
                  </div>
                  <div className="flex items-center gap-3 w-40">
                    <div className="w-8 h-8 bg-zinc-800 rounded-full border border-white/10" />
                    <span className="font-bold text-sm truncate">{match.awayTeamName}</span>
                  </div>
                </div>
                <div className="text-right hidden md:block">
                  <div className="text-xs font-bold text-zinc-500 uppercase">{match.date?.toDate().toLocaleDateString('pt-BR')}</div>
                  <div className="text-[10px] text-zinc-600 font-bold">{match.championshipName}</div>
                </div>
              </Link>
            ))}
            {finishedMatches.length === 0 && (
              <div className="p-12 text-center text-zinc-500 font-bold">Nenhuma partida registrada.</div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
