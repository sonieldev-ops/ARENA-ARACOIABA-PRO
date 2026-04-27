'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase/client';
import { collectionGroup, query, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { Loader2, Goal, User } from 'lucide-react';

export default function PublicScorersPage() {
  const [scorers, setScorers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Busca artilharia em todos os campeonatos via collectionGroup se estruturado assim,
    // ou de um campeonato específico. Para o exemplo, buscamos da coleção raiz 'scorers'.
    const q = query(
      collection(db, 'scorers'),
      orderBy('goals', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setScorers(data);
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

  return (
    <main className="min-h-screen bg-[#0B0C0E] text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <div className="bg-[#FACC15] p-3 rounded-2xl">
            <Goal className="w-8 h-8 text-black" />
          </div>
          <div>
            <h1 className="text-3xl font-black italic uppercase tracking-tighter">
              Artilharia <span className="text-[#FACC15]">Pro</span>
            </h1>
            <p className="text-zinc-500 font-bold">OS MELHORES DA TEMPORADA</p>
          </div>
        </div>

        <div className="grid gap-4">
          {scorers.map((player, index) => (
            <div
              key={player.id}
              className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4 flex items-center justify-between hover:bg-white/5 transition-all"
            >
              <div className="flex items-center gap-6">
                <span className={`text-2xl font-black italic w-8 ${index < 3 ? 'text-[#FACC15]' : 'text-zinc-700'}`}>
                  {index + 1}º
                </span>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center border border-white/10">
                    <User className="w-6 h-6 text-zinc-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{player.playerName}</h3>
                    <p className="text-zinc-500 text-xs font-bold uppercase">{player.teamName}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <span className="text-3xl font-black text-[#FACC15]">{player.goals}</span>
                  <span className="text-[10px] block font-black text-zinc-500 uppercase tracking-widest">GOLS</span>
                </div>
              </div>
            </div>
          ))}
          {scorers.length === 0 && (
            <div className="p-12 text-center text-zinc-500 font-bold border border-dashed border-white/5 rounded-3xl">
              Aguardando o início da competição para atualizar a artilharia.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

import { collection } from 'firebase/firestore';
