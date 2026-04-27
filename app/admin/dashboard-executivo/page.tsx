'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/src/lib/firebase/client';
import { AdminPageHeader } from '@/src/modules/admin/components/AdminPageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Users, Calendar, DollarSign, Activity, TrendingUp, CheckCircle2, Loader2 } from 'lucide-react';

export default function ExecutiveDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    championships: 0,
    teams: 0,
    athletes: 0,
    liveMatches: 0,
    revenue: 0,
    totalMatches: 0
  });

  useEffect(() => {
    async function loadStats() {
      try {
        const [champs, teams, athletes, matches] = await Promise.all([
          getDocs(collection(db, 'campeonatos')),
          getDocs(collection(db, 'times')),
          getDocs(collection(db, 'atletas')),
          getDocs(collection(db, 'partidas'))
        ]);

        const totalRevenue = teams.docs.reduce((acc, doc) => acc + (doc.data().paymentStatus === 'PAID' ? 500 : 0), 0);

        setStats({
          championships: champs.size,
          teams: teams.size,
          athletes: athletes.size,
          liveMatches: matches.docs.filter(m => m.data().status === 'LIVE').length,
          revenue: totalRevenue,
          totalMatches: matches.size
        });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) return <div className="flex items-center justify-center h-96"><Loader2 className="animate-spin text-red-600" /></div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <AdminPageHeader
        title="Dashboard Executivo"
        subtitle="Visão geral e KPIs de alto nível da Arena Pro."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         <Card className="bg-slate-900 border-slate-800 rounded-[2rem] overflow-hidden shadow-2xl p-8">
            <div className="flex justify-between items-start mb-4">
               <div className="w-12 h-12 bg-red-600/10 rounded-2xl flex items-center justify-center text-red-600">
                  <Trophy className="w-6 h-6" />
               </div>
               <Badge className="bg-emerald-500/10 text-emerald-500 border-none font-black text-[8px]">EM ALTA</Badge>
            </div>
            <h3 className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mb-1">Campeonatos Ativos</h3>
            <p className="text-4xl font-black text-white italic">{stats.championships}</p>
         </Card>

         <Card className="bg-slate-900 border-slate-800 rounded-[2rem] overflow-hidden shadow-2xl p-8">
            <div className="flex justify-between items-start mb-4">
               <div className="w-12 h-12 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-600">
                  <Users className="w-6 h-6" />
               </div>
            </div>
            <h3 className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mb-1">Total de Atletas</h3>
            <p className="text-4xl font-black text-white italic">{stats.athletes.toLocaleString()}</p>
         </Card>

         <Card className="bg-slate-900 border-slate-800 rounded-[2rem] overflow-hidden shadow-2xl p-8 border-l-4 border-l-emerald-500">
            <div className="flex justify-between items-start mb-4">
               <div className="w-12 h-12 bg-emerald-600/10 rounded-2xl flex items-center justify-center text-emerald-600">
                  <DollarSign className="w-6 h-6" />
               </div>
               <TrendingUp className="text-emerald-500 w-5 h-5" />
            </div>
            <h3 className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mb-1">Receita Líquida</h3>
            <p className="text-4xl font-black text-emerald-500 italic">R$ {stats.revenue.toLocaleString()}</p>
         </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <Card className="bg-slate-900 border-slate-800 rounded-[2rem] overflow-hidden shadow-2xl">
            <CardHeader className="p-8 border-b border-white/5">
               <CardTitle className="text-white font-black uppercase text-xs tracking-widest flex items-center gap-2">
                  <Activity className="w-4 h-4 text-red-600" /> Atividade de Partidas
               </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
               <div className="flex items-center gap-12">
                  <div className="text-center">
                     <p className="text-slate-500 text-[10px] font-black uppercase mb-2">Total Jogos</p>
                     <p className="text-5xl font-black text-white italic">{stats.totalMatches}</p>
                  </div>
                  <div className="h-16 w-px bg-white/10" />
                  <div className="text-center">
                     <p className="text-red-500 text-[10px] font-black uppercase mb-2 animate-pulse">Ao Vivo Agora</p>
                     <p className="text-5xl font-black text-red-600 italic">{stats.liveMatches}</p>
                  </div>
               </div>
            </CardContent>
         </Card>

         <Card className="bg-slate-900 border-slate-800 rounded-[2rem] overflow-hidden shadow-2xl">
            <CardHeader className="p-8 border-b border-white/5">
               <CardTitle className="text-white font-black uppercase text-xs tracking-widest flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-600" /> Próximos Passos
               </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-4">
               <div className="flex items-center gap-4 p-4 bg-slate-950 rounded-2xl border border-white/5">
                  <div className="w-8 h-8 rounded-full bg-blue-600/10 flex items-center justify-center text-blue-600 font-black text-xs">1</div>
                  <p className="text-slate-300 text-sm font-medium">Revisar taxas de {stats.championships} campeonatos ativos.</p>
               </div>
               <div className="flex items-center gap-4 p-4 bg-slate-950 rounded-2xl border border-white/5">
                  <div className="w-8 h-8 rounded-full bg-blue-600/10 flex items-center justify-center text-blue-600 font-black text-xs">2</div>
                  <p className="text-slate-300 text-sm font-medium">Validar inscrições pendentes de {stats.teams} times.</p>
               </div>
            </CardContent>
         </Card>
      </div>
    </div>
  );
}

function Badge({ children, className }: any) {
  return <span className={`px-2 py-0.5 rounded-md ${className}`}>{children}</span>;
}
