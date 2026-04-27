'use client';

import { useEffect, useState } from 'react';
import { db } from '@/src/lib/firebase/client';
import { collection, query, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { Loader2, Goal, User, Trophy, Medal, ArrowLeft } from 'lucide-react';
import { sanitizeData } from '@/src/lib/utils';
import Link from 'next/link';

export default function PublicScorersPage() {
  const [scorers, setScorers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Buscamos atletas com gols marcados de forma global
    const q = query(collection(db, 'atletas'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs
        .map(doc => sanitizeData({ id: doc.id, ...doc.data() }))
        .filter(athlete => (athlete.goals || 0) > 0);
      
      // Ordenação manual por gols (descrescente)
      data.sort((a, b) => (b.goals || 0) - (a.goals || 0));
      
      setScorers(data.slice(0, 50)); // Mantém o limite de 50
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0B0C0E] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-[#FACC15]" />
        <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs text-center">CARREGANDO ARTILHARIA...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#0B0C0E] text-white p-4 md:p-8 pb-32">
      <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in duration-700">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-8">
          <div className="flex items-center gap-6">
            <div className="bg-[#FACC15] p-5 rounded-[2rem] shadow-2xl shadow-[#FACC15]/20">
              <Goal className="w-10 h-10 text-black" />
            </div>
            <div>
              <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter leading-none">
                ARTILHARIA <span className="text-[#FACC15]">ARENA</span>
              </h1>
              <p className="text-zinc-500 font-black tracking-[0.2em] text-xs mt-2 uppercase">Os maiores goleadores da temporada</p>
            </div>
          </div>
          <Link href="/" className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors font-black uppercase text-[10px] tracking-widest">
            <ArrowLeft className="w-4 h-4" /> Voltar ao Início
          </Link>
        </div>

        <div className="grid gap-4">
          {scorers.map((player, index) => (
            <div
              key={player.id}
              className={`
                relative bg-zinc-900/40 border border-white/5 rounded-[2rem] p-6 flex items-center justify-between transition-all hover:bg-zinc-900/80 hover:border-[#FACC15]/30 group
                ${index === 0 ? 'bg-gradient-to-r from-zinc-900 to-[#FACC15]/5 border-[#FACC15]/20' : ''}
              `}
            >
               {index < 3 && (
                 <div className="absolute -top-3 -left-3">
                   <Medal className={`w-10 h-10 ${index === 0 ? 'text-[#FACC15]' : index === 1 ? 'text-zinc-400' : 'text-amber-800'}`} />
                 </div>
               )}

              <div className="flex items-center gap-8">
                <span className={`text-4xl font-black italic w-12 text-center ${index < 3 ? 'text-[#FACC15]' : 'text-zinc-800'}`}>
                  {index + 1}º
                </span>
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-zinc-950 rounded-2xl flex items-center justify-center border border-white/5 group-hover:border-[#FACC15]/50 transition-colors">
                    <User className="w-8 h-8 text-zinc-700 group-hover:text-[#FACC15] transition-colors" />
                  </div>
                  <div>
                    <h3 className="font-black text-xl uppercase italic group-hover:text-[#FACC15] transition-colors tracking-tight">
                        {player.fullName || player.name}
                    </h3>
                    <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mt-1 flex items-center gap-2">
                       <Trophy className="w-3 h-3 text-[#FACC15]/50" />
                       {player.teamName}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6 pl-8 border-l border-white/5">
                <div className="text-right">
                  <span className="text-5xl font-black italic tracking-tighter text-[#FACC15] tabular-nums leading-none">{player.goals}</span>
                  <span className="text-[10px] block font-black text-zinc-600 uppercase tracking-widest mt-1">Gols</span>
                </div>
              </div>
            </div>
          ))}
          
          {scorers.length === 0 && (
            <div className="p-32 text-center text-zinc-700 font-black uppercase tracking-[0.3em] text-xs border-2 border-dashed border-white/5 rounded-[3rem]">
               <Trophy className="w-16 h-16 mx-auto mb-6 opacity-5" />
               Aguardando os primeiros gols da competição.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
