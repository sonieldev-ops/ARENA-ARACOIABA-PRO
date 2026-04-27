'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { db } from '@/src/lib/firebase/client';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { AdminPageHeader } from '@/src/modules/admin/components/AdminPageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Users, Swords, Settings, ArrowLeft, Loader2, Calendar, MapPin } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';

export default function ChampionshipDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [champ, setChamp] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    teamsCount: 0,
    matchesCount: 0,
    liveMatches: 0
  });

  useEffect(() => {
    async function loadData() {
      if (!id) return;
      try {
        const champDoc = await getDoc(doc(db, 'campeonatos', id as string));
        if (!champDoc.exists()) {
          router.push('/admin/campeonatos');
          return;
        }
        setChamp({ id: champDoc.id, ...champDoc.data() });

        // Fetch Stats
        const teamsSnap = await getDocs(query(collection(db, 'times'), where('championshipId', '==', id)));
        const matchesSnap = await getDocs(query(collection(db, 'partidas'), where('championshipId', '==', id)));

        setStats({
          teamsCount: teamsSnap.size,
          matchesCount: matchesSnap.size,
          liveMatches: matchesSnap.docs.filter(d => d.data().status === 'LIVE').length
        });

      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id, router]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-amber-500" />
        <p className="text-zinc-500 font-medium italic">Sincronizando dados da liga...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild className="rounded-full hover:bg-zinc-900">
           <Link href="/admin/campeonatos"><ArrowLeft className="h-5 w-5 text-zinc-400" /></Link>
        </Button>
        <AdminPageHeader
          title={champ?.name}
          subtitle={`Gerenciamento operacional e estatísticas do torneio.`}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-zinc-950 border-zinc-800 shadow-xl overflow-hidden group">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-4 bg-amber-500/10 rounded-2xl border border-amber-500/20 group-hover:bg-amber-500 group-hover:text-zinc-950 transition-all">
              <Users className="h-6 w-6 text-amber-500 group-hover:text-inherit" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Equipes</p>
              <p className="text-2xl font-black text-white italic">{stats.teamsCount}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-950 border-zinc-800 shadow-xl overflow-hidden group">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20 group-hover:bg-blue-500 group-hover:text-zinc-950 transition-all">
              <Swords className="h-6 w-6 text-blue-500 group-hover:text-inherit" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Partidas</p>
              <p className="text-2xl font-black text-white italic">{stats.matchesCount}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-950 border-zinc-800 shadow-xl overflow-hidden group">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-zinc-950 transition-all">
              <Trophy className="h-6 w-6 text-emerald-500 group-hover:text-inherit" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Status</p>
              <p className="text-sm font-bold text-emerald-500 uppercase tracking-widest">
                {champ?.status === 'OPEN' ? 'Em Andamento' : 'Finalizado'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-zinc-900 border border-zinc-800 p-1 h-14 rounded-2xl">
          <TabsTrigger value="overview" className="px-8 font-black uppercase text-[10px] tracking-widest rounded-xl data-[state=active]:bg-amber-500 data-[state=active]:text-zinc-950 h-full">Visão Geral</TabsTrigger>
          <TabsTrigger value="teams" className="px-8 font-black uppercase text-[10px] tracking-widest rounded-xl data-[state=active]:bg-amber-500 data-[state=active]:text-zinc-950 h-full">Equipes</TabsTrigger>
          <TabsTrigger value="matches" className="px-8 font-black uppercase text-[10px] tracking-widest rounded-xl data-[state=active]:bg-amber-500 data-[state=active]:text-zinc-950 h-full">Tabela</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="bg-zinc-900/40 border-zinc-800 rounded-[2rem] overflow-hidden">
               <CardHeader className="p-8 border-b border-zinc-800">
                  <CardTitle className="text-white font-black italic uppercase tracking-tighter flex items-center gap-3">
                    <Settings className="h-5 w-5 text-amber-500" />
                    Configurações da Competição
                  </CardTitle>
               </CardHeader>
               <CardContent className="p-8 space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                     <div className="p-4 bg-zinc-950 rounded-2xl border border-zinc-800">
                        <p className="text-[9px] font-black text-zinc-500 uppercase mb-1">Data de Início</p>
                        <p className="text-white font-bold text-sm">20/04/2026</p>
                     </div>
                     <div className="p-4 bg-zinc-950 rounded-2xl border border-zinc-800">
                        <p className="text-[9px] font-black text-zinc-500 uppercase mb-1">Local Padrão</p>
                        <p className="text-white font-bold text-sm">Arena Araçoiaba</p>
                     </div>
                  </div>
                  <Button className="w-full bg-zinc-100 hover:bg-white text-zinc-950 font-black uppercase tracking-widest h-12 rounded-xl">
                    Editar Informações
                  </Button>
               </CardContent>
            </Card>

            <div className="bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/20 rounded-[2rem] p-10 flex flex-col justify-center relative overflow-hidden group">
               <Trophy className="absolute -right-8 -bottom-8 w-48 h-48 text-amber-500/5 rotate-12 group-hover:scale-110 transition-transform" />
               <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-4">Relatório <span className="text-amber-500">Premium</span></h3>
               <p className="text-zinc-400 text-sm mb-8 leading-relaxed max-w-md">
                 Gere documentos oficiais, tabelas de classificação em PDF e súmulas automáticas para sua liga municipal.
               </p>
               <Button className="w-fit bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black uppercase tracking-widest px-8 h-12 rounded-xl shadow-lg shadow-amber-900/20 transition-all active:scale-95">
                 Exportar Dados
               </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="teams">
           <div className="py-20 text-center bg-zinc-900/20 border border-dashed border-zinc-800 rounded-[2rem]">
              <Users className="h-12 w-12 text-zinc-700 mx-auto mb-4" />
              <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Módulo de Equipes deste campeonato em desenvolvimento.</p>
           </div>
        </TabsContent>

        <TabsContent value="matches">
           <div className="py-20 text-center bg-zinc-900/20 border border-dashed border-zinc-800 rounded-[2rem]">
              <Swords className="h-12 w-12 text-zinc-700 mx-auto mb-4" />
              <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Tabela de jogos deste campeonato em desenvolvimento.</p>
           </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
