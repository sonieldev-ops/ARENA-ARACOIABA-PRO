'use client';

export const dynamic = 'force-static';
export const dynamicParams = true;

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { db } from '@/src/lib/firebase/client';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { Loader2, Trophy, Medal, ArrowLeft, Download } from 'lucide-react';
import { sanitizeData } from '@/src/lib/utils';
import Link from 'next/link';
import { exportRankingToPDF } from '@/src/lib/pdf-export';
import { doc, getDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';

import { RankingService } from '@/lib/firebase/ranking-service';
import { WhiteLabelTheme } from '@/src/modules/shared/components/WhiteLabelTheme';

export default function PublicRankingPage() {
  const params = useParams();
  const championshipId = params.championshipId as string;
  const [rankings, setRankings] = useState<any[]>([]);
  const [championship, setChampionship] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    // 1. Busca detalhes do campeonato com listener em tempo real
    if (championshipId) {
      const unsubChamp = onSnapshot(doc(db, 'campeonatos', championshipId), (snap) => {
        if (snap.exists()) setChampionship(snap.data());
      });

      // 2. Busca a classificação específica do campeonato
      const q = query(collection(db, 'classificacoes'));
      const unsubRank = onSnapshot(q, (snapshot) => {
        const data = snapshot.docs
          .map(doc => sanitizeData({ id: doc.id, ...doc.data() }))
          .filter(r => !championshipId || r.championshipId === championshipId);
        
        const sortedData = RankingService.sortRanking(data);

        setRankings(sortedData);
        setLoading(false);
      });

      return () => { unsubChamp(); unsubRank(); };
    }
  }, [championshipId]);

  const handleExport = () => {
    if (rankings.length > 0) {
      exportRankingToPDF(championship?.name || 'Campeonato', rankings);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0B0C0E] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-[#FACC15]" />
        <p className="text-zinc-500 font-black uppercase tracking-widest text-xs">Atualizando Tabela...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#0B0C0E] text-white p-4 md:p-8 pb-32">
      <WhiteLabelTheme config={championship} />
      <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in duration-700">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-8">
          <div className="flex items-center gap-6">
            <div className="bg-[#FACC15] p-5 rounded-[2rem] shadow-2xl shadow-[#FACC15]/20 theme-bg-primary theme-shadow-primary">
              {championship?.logoUrl ? (
                <img src={championship.logoUrl} alt="Logo" className="w-10 h-10 object-contain" />
              ) : (
                <Trophy className="w-10 h-10 text-black btn-text-secondary" />
              )}
            </div>
            <div>
              <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter leading-none">
                TABELA DE <span className="text-[#FACC15] theme-primary">LÍDERES</span>
              </h1>
              <p className="text-zinc-500 font-black tracking-[0.2em] text-xs mt-2 uppercase">{championship?.name || 'Classificação Geral'}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button 
              onClick={handleExport}
              disabled={rankings.length === 0}
              className="bg-[#FACC15] hover:bg-[#EAB308] text-black font-black uppercase text-[10px] tracking-widest rounded-full px-6 h-10 shadow-lg shadow-[#FACC15]/20 gap-2 btn-custom-primary"
            >
              <Download className="w-4 h-4" /> Exportar PDF
            </Button>
            <Link href="/classificacao" className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors font-black uppercase text-[10px] tracking-widest bg-white/5 px-6 h-10 rounded-full border border-white/10">
              <ArrowLeft className="w-4 h-4" /> Voltar
            </Link>
          </div>
        </div>

        <div className="bg-zinc-900/40 border border-white/5 rounded-[3rem] overflow-hidden shadow-2xl">
          {championship?.bannerUrl && (
            <div className="w-full h-48 md:h-64 overflow-hidden border-b border-white/5">
               <img src={championship.bannerUrl} alt="Banner" className="w-full h-full object-cover" />
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em]">
                  <th className="px-8 py-6">Posição</th>
                  <th className="px-8 py-6">Equipe</th>
                  <th className="px-8 py-6 text-center">PTS</th>
                  <th className="px-8 py-6 text-center">PJ</th>
                  <th className="px-8 py-6 text-center">VIT</th>
                  <th className="px-8 py-6 text-center">SG</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {rankings.map((team, index) => (
                  <tr key={team.id} className="hover:bg-white/5 transition-all group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <span className={`text-3xl font-black italic ${index < 3 ? 'text-[#FACC15] theme-primary' : 'text-zinc-800'}`}>
                          {index + 1}º
                        </span>
                        {index < 3 && <Medal className={`w-5 h-5 ${index === 0 ? 'text-[#FACC15] theme-primary' : index === 1 ? 'text-zinc-400' : 'text-amber-800'}`} />}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-zinc-950 rounded-2xl flex items-center justify-center border border-white/5 group-hover:border-[#FACC15]/50 group-hover:theme-border-primary transition-colors">
                            <span className="font-black text-zinc-700 group-hover:text-[#FACC15] group-hover:theme-primary transition-colors">{team.name?.substring(0, 2).toUpperCase() || team.teamName?.substring(0, 2).toUpperCase()}</span>
                        </div>
                        <span className="font-black text-lg uppercase italic group-hover:text-[#FACC15] group-hover:theme-primary transition-colors tracking-tight">
                          {team.name || team.teamName}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center font-black text-2xl text-[#FACC15] theme-primary tabular-nums">{team.points || 0}</td>
                    <td className="px-8 py-6 text-center text-zinc-400 font-bold tabular-nums">{team.played || 0}</td>
                    <td className="px-8 py-6 text-center text-zinc-400 font-bold tabular-nums">{team.victories || 0}</td>
                    <td className={`px-8 py-6 text-center font-black tabular-nums ${
                      (team.goalDifference || 0) > 0 ? 'text-green-500' : 
                      (team.goalDifference || 0) < 0 ? 'text-red-500' : 'text-zinc-500'
                    }`}>
                      {team.goalDifference || 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {rankings.length === 0 && (
            <div className="p-32 text-center text-zinc-700 font-black uppercase tracking-[0.3em] text-xs border-t border-white/5">
               <Trophy className="w-16 h-16 mx-auto mb-6 opacity-5" />
               Aguardando a conclusão das primeiras partidas.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
