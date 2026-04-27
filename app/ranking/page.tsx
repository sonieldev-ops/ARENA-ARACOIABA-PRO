'use client';

import { useEffect, useState } from 'react';
import { db } from '@/src/lib/firebase/client';
import { collection, query, onSnapshot, getDocs, where, orderBy } from 'firebase/firestore';
import { Trophy, ArrowLeft, ChevronRight, LayoutDashboard, Download, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { sanitizeData } from '@/src/lib/utils';
import { exportRankingToPDF } from '@/src/lib/pdf-export';

export default function RankingSelectionPage() {
  const [championships, setChampionships] = useState<any[]>([]);
  const [selectedChamp, setSelectedChamp] = useState<string>('');
  const [ranking, setRanking] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'campeonatos'),
      where('status', 'in', ['ACTIVE', 'FINISHED', 'OPEN'])
    );
    getDocs(q).then((snap) => {
      const data = snap.docs.map(doc => sanitizeData({ id: doc.id, ...doc.data() }));
      setChampionships(data);
      if (data.length > 0) setSelectedChamp(data[0].id);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!selectedChamp) return;
    const q = query(
      collection(db, 'classificacoes'),
      where('championshipId', '==', selectedChamp),
      orderBy('points', 'desc'),
      orderBy('goalDifference', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snap) => {
      setRanking(snap.docs.map(doc => doc.data()));
    });
    return () => unsubscribe();
  }, [selectedChamp]);

  const handleExport = () => {
    const champ = championships.find(c => c.id === selectedChamp);
    if (champ && ranking.length > 0) {
      exportRankingToPDF(champ.name, ranking);
    }
  };

  return (
    <main className="min-h-screen bg-[#0B0C0E] text-white p-4 md:p-8 pb-32">
      <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in duration-700">
        <div className="flex items-center justify-between border-b border-white/5 pb-8">
          <div className="flex items-center gap-6">
            <div className="bg-[#FACC15] p-5 rounded-[2rem] shadow-2xl shadow-[#FACC15]/20">
              <LayoutDashboard className="w-10 h-10 text-black" />
            </div>
            <div>
              <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter leading-none">
                TABELAS DE <span className="text-[#FACC15]">LÍDERES</span>
              </h1>
              <p className="text-zinc-500 font-black tracking-[0.2em] text-xs mt-2 uppercase">Escolha uma competição</p>
            </div>
          </div>
          <Link href="/" className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors font-black uppercase text-[10px] tracking-widest">
            <ArrowLeft className="w-4 h-4" /> Início
          </Link>
        </div>

        <div className="grid gap-4">
          {championships.map((champ) => (
            <Link
              key={champ.id}
              href={`/classificacao/${champ.id}`}
              className="bg-zinc-900/40 border border-white/5 rounded-[2.5rem] p-8 flex items-center justify-between transition-all hover:bg-zinc-900/80 hover:border-[#FACC15]/30 group"
            >
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-zinc-950 rounded-2xl flex items-center justify-center border border-white/5 group-hover:border-[#FACC15]/50 transition-colors">
                  <Trophy className="w-8 h-8 text-zinc-700 group-hover:text-[#FACC15] transition-colors" />
                </div>
                <div>
                  <h3 className="font-black text-2xl uppercase italic group-hover:text-[#FACC15] transition-colors tracking-tight">
                    {champ.name}
                  </h3>
                  <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mt-1">
                    {champ.season || 'Temporada 2024'} • {champ.city}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-6 h-6 text-zinc-700 group-hover:text-[#FACC15] transition-all transform group-hover:translate-x-2" />
            </Link>
          ))}

          {championships.length === 0 && !loading && (
            <div className="p-32 text-center text-zinc-700 font-black uppercase tracking-[0.3em] text-xs border-2 border-dashed border-white/5 rounded-[3rem]">
               <Trophy className="w-16 h-16 mx-auto mb-6 opacity-5" />
               Nenhum campeonato ativo no momento.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
