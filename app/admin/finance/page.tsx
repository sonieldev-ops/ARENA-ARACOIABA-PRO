'use client';

export const dynamic = 'force-static';

import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, where, doc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';
import { db } from '@/src/lib/firebase/client';
import { AdminPageHeader } from '@/src/modules/admin/components/AdminPageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { DollarSign, TrendingUp, AlertCircle, CheckCircle2, Search, Filter, QrCode, FileText } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

export default function FinanceAdminPage() {
  const [loading, setLoading] = useState(true);
  const [teams, setTeams] = useState<any[]>([]);
  const [championships, setChampionships] = useState<any[]>([]);
  const [selectedChamp, setSelectedChamp] = useState('all');

  const [stats, setConfig] = useState({
    totalExpected: 0,
    totalReceived: 0,
    totalPending: 0,
    defaultFee: 500
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const champSnap = await getDocs(collection(db, 'campeonatos'));
      const champs = champSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      setChampionships(champs);

      let teamQuery = query(collection(db, 'times'), orderBy('createdAt', 'desc'));
      const teamSnap = await getDocs(teamQuery);
      let teamList = teamSnap.docs.map(d => ({ id: d.id, ...d.data() } as any));

      if (selectedChamp !== 'all') {
        teamList = teamList.filter(t => t.championshipId === selectedChamp);
      }

      setTeams(teamList);

      // Calcular KPIs
      const received = teamList.reduce((acc, t) => acc + (t.paymentStatus === 'PAID' ? (t.paymentAmount || 500) : 0), 0);
      const pending = teamList.reduce((acc, t) => acc + (t.paymentStatus !== 'PAID' && t.paymentStatus !== 'EXEMPT' ? 500 : 0), 0);

      setConfig({
        totalExpected: received + pending,
        totalReceived: received,
        totalPending: pending,
        defaultFee: 500
      });
    } catch (e) {
      console.error(e);
      toast.error('Erro ao carregar dados financeiros');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedChamp]);

  const updatePayment = async (teamId: string, status: string) => {
    try {
      await updateDoc(doc(db, 'times', teamId), {
        paymentStatus: status,
        paymentAmount: status === 'PAID' ? 500 : 0,
        paidAt: status === 'PAID' ? serverTimestamp() : null
      });
      toast.success('Pagamento atualizado!');
      fetchData();
    } catch (e) {
      toast.error('Falha ao atualizar');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <AdminPageHeader
        title="Controle Financeiro"
        subtitle="Gestão de taxas de inscrição e recebíveis de equipes."
        action={
          <div className="flex gap-3">
             <Select value={selectedChamp} onValueChange={setSelectedChamp}>
                <SelectTrigger className="w-64 bg-slate-900 border-slate-800 text-white rounded-xl h-12">
                   <SelectValue placeholder="Filtrar por Campeonato" />
                </SelectTrigger>
                <SelectContent className="bg-slate-950 border-slate-800 text-white">
                   <SelectItem value="all">Todos os Campeonatos</SelectItem>
                   {championships.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
             </Select>
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         <Card className="bg-slate-900 border-slate-800 rounded-3xl overflow-hidden shadow-xl border-b-4 border-b-blue-600">
            <CardContent className="p-6">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-600">
                     <DollarSign className="w-6 h-6" />
                  </div>
                  <div>
                     <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Receita Prevista</p>
                     <p className="text-2xl font-black text-white">R$ {stats.totalExpected.toLocaleString()}</p>
                  </div>
               </div>
            </CardContent>
         </Card>
         <Card className="bg-slate-900 border-slate-800 rounded-3xl overflow-hidden shadow-xl border-b-4 border-b-emerald-600">
            <CardContent className="p-6">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-600/10 rounded-2xl flex items-center justify-center text-emerald-600">
                     <TrendingUp className="w-6 h-6" />
                  </div>
                  <div>
                     <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Recebido</p>
                     <p className="text-2xl font-black text-emerald-500">R$ {stats.totalReceived.toLocaleString()}</p>
                  </div>
               </div>
            </CardContent>
         </Card>
         <Card className="bg-slate-900 border-slate-800 rounded-3xl overflow-hidden shadow-xl border-b-4 border-b-red-600">
            <CardContent className="p-6">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-red-600/10 rounded-2xl flex items-center justify-center text-red-600">
                     <AlertCircle className="w-6 h-6" />
                  </div>
                  <div>
                     <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Pendente</p>
                     <p className="text-2xl font-black text-red-500">R$ {stats.totalPending.toLocaleString()}</p>
                  </div>
               </div>
            </CardContent>
         </Card>
         <Card className="bg-slate-900 border-slate-800 rounded-3xl overflow-hidden shadow-xl border-b-4 border-b-amber-600">
            <CardContent className="p-6">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-amber-600/10 rounded-2xl flex items-center justify-center text-amber-600">
                     <QrCode className="w-6 h-6" />
                  </div>
                  <div>
                     <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Inadimplência</p>
                     <p className="text-2xl font-black text-amber-500">
                        {stats.totalExpected > 0 ? Math.round((stats.totalPending / stats.totalExpected) * 100) : 0}%
                     </p>
                  </div>
               </div>
            </CardContent>
         </Card>
      </div>

      <Card className="bg-slate-900 border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
         <div className="p-8 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
            <h3 className="text-white font-black italic uppercase tracking-tighter">Status de Pagamento por Equipe</h3>
            <div className="relative w-72">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
               <Input placeholder="Buscar time..." className="bg-slate-900 border-slate-800 pl-10 h-10 rounded-xl" />
            </div>
         </div>
         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead>
                  <tr className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] bg-slate-950/30">
                     <th className="px-8 py-4">Equipe</th>
                     <th className="px-8 py-4">Campeonato</th>
                     <th className="px-8 py-4">Valor</th>
                     <th className="px-8 py-4">Status</th>
                     <th className="px-8 py-4 text-right">Ações</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-800">
                  {teams.map(team => (
                     <tr key={team.id} className="hover:bg-white/5 transition-colors group">
                        <td className="px-8 py-5">
                           <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center p-2">
                                 {team.logoUrl ? <img src={team.logoUrl} className="object-contain" /> : <span className="text-black font-black">{team.name[0]}</span>}
                              </div>
                              <span className="font-bold text-white">{team.name}</span>
                           </div>
                        </td>
                        <td className="px-8 py-5">
                           <span className="text-xs text-slate-400 font-medium">{team.championshipName || '-'}</span>
                        </td>
                        <td className="px-8 py-5">
                           <span className="font-mono text-white">R$ 500,00</span>
                        </td>
                        <td className="px-8 py-5">
                           <Badge className={`
                              font-black text-[9px] px-3 py-1 rounded-full tracking-widest
                              ${team.paymentStatus === 'PAID' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                                team.paymentStatus === 'LATE' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                                'bg-slate-800 text-slate-400'}
                           `}>
                              {team.paymentStatus || 'PENDING'}
                           </Badge>
                        </td>
                        <td className="px-8 py-5 text-right">
                           <div className="flex justify-end gap-2">
                              {team.paymentStatus !== 'PAID' && (
                                 <Button
                                    size="sm"
                                    onClick={() => updatePayment(team.id, 'PAID')}
                                    className="bg-emerald-600 hover:bg-emerald-700 h-8 rounded-lg text-[10px] font-black uppercase"
                                 >
                                    Confirmar PIX
                                 </Button>
                              )}
                              <Button variant="outline" size="icon" className="h-8 w-8 border-slate-800">
                                 <FileText className="w-3 h-3 text-slate-400" />
                              </Button>
                           </div>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </Card>
    </div>
  );
}
