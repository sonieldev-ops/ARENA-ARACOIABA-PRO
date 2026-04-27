'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { db } from '@/src/lib/firebase/client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Trophy, Plus, Loader2, Calendar, LayoutGrid } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function ChampionshipsAdminPage() {
  const [championships, setChampionships] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');

  const fetchChampionships = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'championships'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      setChampionships(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error('Erro ao buscar campeonatos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChampionships();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    try {
      await addDoc(collection(db, 'championships'), {
        name: newName,
        status: 'OPEN',
        createdAt: serverTimestamp(),
        startDate: new Date(),
      });
      setNewName('');
      setIsCreating(false);
      fetchChampionships();
    } catch (error) {
      alert('Erro ao criar campeonato. Verifique as permissões.');
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
            <Trophy className="h-8 w-8 text-amber-500" />
            Campeonatos
          </h1>
          <p className="text-slate-500 font-medium">Gerencie suas competições e ligas.</p>
        </div>
        <Button onClick={() => setIsCreating(!isCreating)} className="bg-blue-600">
          <Plus className="mr-2 h-4 w-4" /> Novo Campeonato
        </Button>
      </div>

      {isCreating && (
        <Card className="border-2 border-blue-100 bg-blue-50/30">
          <CardHeader>
            <CardTitle className="text-sm uppercase tracking-wider text-blue-600">Configurar Nova Competição</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="flex gap-4">
              <Input
                placeholder="Ex: Copa Verão 2024"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="bg-white"
              />
              <Button type="submit" className="bg-blue-600 px-8">CRIAR</Button>
            </form>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-slate-300" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {championships.map((champ) => (
            <Card key={champ.id} className="hover:border-blue-200 transition-colors cursor-pointer group">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-slate-100 rounded-2xl group-hover:bg-blue-100 transition-colors">
                    <LayoutGrid className="h-6 w-6 text-slate-600 group-hover:text-blue-600" />
                  </div>
                  <Badge variant={champ.status === 'OPEN' ? 'default' : 'secondary'} className="bg-emerald-500">
                    {champ.status}
                  </Badge>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-1">{champ.name}</h3>
                <div className="flex items-center gap-2 text-slate-400 text-sm">
                  <Calendar className="h-4 w-4" />
                  <span>Criado em {champ.createdAt?.toDate().toLocaleDateString('pt-BR')}</span>
                </div>
              </CardContent>
            </Card>
          ))}
          {championships.length === 0 && (
            <div className="col-span-full text-center py-20 border-2 border-dashed rounded-3xl">
              <Trophy className="h-12 w-12 text-slate-200 mx-auto mb-4" />
              <p className="text-slate-400 font-medium">Nenhum campeonato encontrado.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
