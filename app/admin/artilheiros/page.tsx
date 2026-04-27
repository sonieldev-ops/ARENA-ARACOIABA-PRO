'use client';

import { useEffect, useState } from 'react';
import { db } from '@/src/lib/firebase/client';
import { collectionGroup, query, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { Loader2, Goal, User, ArrowLeft, ShieldCheck } from 'lucide-react';
import { sanitizeData } from '@/src/lib/utils';
import { AdminPageHeader } from '@/src/modules/admin/components/AdminPageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function AdminScorersPage() {
  const [scorers, setScorers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Usando collectionGroup para buscar atletas em qualquer subcoleção, 
    // ou se eles estiverem em uma coleção raiz 'athletes'
    const q = query(collectionGroup(db, 'athletes'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs
        .map(doc => sanitizeData({ id: doc.id, ...doc.data() }))
        .filter(athlete => (athlete.goals || 0) > 0);
      
      // Ordenação manual por gols (decrescente)
      data.sort((a, b) => (b.goals || 0) - (a.goals || 0));
      
      setScorers(data.slice(0, 50)); // Mantém o limite de 50
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <AdminPageHeader
        title="Artilharia do Campeonato"
        subtitle="Ranking dos principais marcadores da temporada."
        action={
          <Button variant="outline" className="border-slate-800 text-slate-400 hover:text-white" asChild>
            <Link href="/admin"><ArrowLeft className="mr-2 h-4 w-4" /> Voltar</Link>
          </Button>
        }
      />

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-red-600" />
          <p className="text-slate-500 font-medium">Carregando artilheiros...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {scorers.map((athlete, index) => (
            <Card key={athlete.id} className="bg-slate-900 border-slate-800 rounded-3xl overflow-hidden hover:border-red-500/50 transition-all group shadow-xl">
              <CardContent className="p-0">
                <div className="relative h-24 bg-gradient-to-r from-red-600/20 to-blue-600/20 flex items-center px-6">
                   <div className="absolute top-4 right-4">
                      <span className={`text-4xl font-black italic ${
                        index === 0 ? 'text-amber-500/20' : 
                        index === 1 ? 'text-slate-400/20' : 
                        index === 2 ? 'text-amber-700/20' : 'text-white/5'
                      }`}>
                        #{index + 1}
                      </span>
                   </div>
                   <div className="w-16 h-16 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-red-600 shadow-2xl relative z-10">
                      <User className="h-8 w-8" />
                   </div>
                   <div className="ml-4 z-10">
                      <h3 className="font-black text-white text-lg leading-tight group-hover:text-red-500 transition-colors">
                        {athlete.fullName || athlete.name || 'Atleta'}
                      </h3>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 mt-1">
                        <ShieldCheck className="h-3 w-3 text-blue-600" />
                        {athlete.teamName || 'Equipe não informada'}
                      </p>
                   </div>
                </div>
                <div className="p-6 flex items-center justify-between bg-slate-900/50">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Gols Marcados</span>
                    <span className="text-3xl font-black text-white">{athlete.goals}</span>
                  </div>
                  <div className="w-12 h-12 bg-red-600/10 rounded-xl flex items-center justify-center border border-red-500/20">
                    <Goal className="h-6 w-6 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {scorers.length === 0 && (
            <div className="col-span-full py-20 text-center">
              <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-700 text-slate-500">
                <Goal className="h-8 w-8" />
              </div>
              <h3 className="text-white font-bold text-lg">Nenhum gol registrado</h3>
              <p className="text-slate-500 text-sm max-w-xs mx-auto mt-2">
                Os artilheiros aparecerão aqui conforme os gols forem registrados no Controle Ao Vivo.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
