'use client';

import { useEffect, useState } from 'react';
import { db } from '@/src/lib/firebase/client';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { Loader2, Trophy, Medal, ListOrdered, ArrowLeft } from 'lucide-react';
import { sanitizeData } from '@/src/lib/utils';
import { AdminPageHeader } from '@/src/modules/admin/components/AdminPageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function AdminRankingPage() {
  const [rankings, setRankings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'classificacoes'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => sanitizeData({ id: doc.id, ...doc.data() }));
      
      // Ordenação manual: Pontos > Vitórias > Saldo de Gols
      data.sort((a, b) => {
        if ((b.points || 0) !== (a.points || 0)) return (b.points || 0) - (a.points || 0);
        if ((b.victories || 0) !== (a.victories || 0)) return (b.victories || 0) - (a.victories || 0);
        return (b.goalDifference || 0) - (a.goalDifference || 0);
      });

      setRankings(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <AdminPageHeader
        title="Classificação Geral"
        subtitle="Acompanhe o desempenho de todas as equipes no campeonato."
        action={
          <Button variant="outline" className="border-slate-800 text-slate-400 hover:text-white" asChild>
            <Link href="/admin"><ArrowLeft className="mr-2 h-4 w-4" /> Voltar</Link>
          </Button>
        }
      />

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-red-600" />
          <p className="text-slate-500 font-medium">Carregando classificação...</p>
        </div>
      ) : (
        <Card className="bg-slate-900 border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/50">
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Pos</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Equipe</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 text-center">P</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 text-center">J</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 text-center">V</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 text-center">E</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 text-center">D</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 text-center">GP</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 text-center">GC</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 text-center">SG</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {rankings.map((team, index) => (
                    <tr key={team.id} className="hover:bg-slate-800/30 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className={`text-sm font-black ${
                            index === 0 ? 'text-amber-500' : 
                            index === 1 ? 'text-slate-400' : 
                            index === 2 ? 'text-amber-700' : 'text-slate-500'
                          }`}>
                            {index + 1}º
                          </span>
                          {index < 3 && <Medal className={`h-4 w-4 ${
                            index === 0 ? 'text-amber-500' : 
                            index === 1 ? 'text-slate-400' : 'text-amber-700'
                          }`} />}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-black text-slate-400 group-hover:border-red-500 transition-colors">
                            {team.name?.substring(0, 2).toUpperCase()}
                          </div>
                          <span className="text-sm font-bold text-white group-hover:text-red-500 transition-colors">{team.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center font-black text-white">{team.points || 0}</td>
                      <td className="px-6 py-4 text-center font-medium text-slate-400">{team.played || 0}</td>
                      <td className="px-6 py-4 text-center font-medium text-slate-400">{team.victories || 0}</td>
                      <td className="px-6 py-4 text-center font-medium text-slate-400">{team.draws || 0}</td>
                      <td className="px-6 py-4 text-center font-medium text-slate-400">{team.losses || 0}</td>
                      <td className="px-6 py-4 text-center font-medium text-slate-400">{team.goalsFor || 0}</td>
                      <td className="px-6 py-4 text-center font-medium text-slate-400">{team.goalsAgainst || 0}</td>
                      <td className={`px-6 py-4 text-center font-bold ${
                        (team.goalDifference || 0) > 0 ? 'text-green-500' : 
                        (team.goalDifference || 0) < 0 ? 'text-red-500' : 'text-slate-500'
                      }`}>
                        {team.goalDifference || 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {rankings.length === 0 && (
              <div className="p-20 text-center">
                <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-700">
                  <ListOrdered className="h-8 w-8 text-slate-500" />
                </div>
                <h3 className="text-white font-bold text-lg">Nenhum dado encontrado</h3>
                <p className="text-slate-500 text-sm max-w-xs mx-auto mt-2">
                  A classificação será atualizada automaticamente assim que as partidas forem encerradas.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
