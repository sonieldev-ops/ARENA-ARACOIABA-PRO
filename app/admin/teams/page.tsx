'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, serverTimestamp, query, orderBy, where } from 'firebase/firestore';
import { db } from '@/src/lib/firebase/client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Users, Plus, Loader2, Trophy, Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

export default function TeamsAdminPage() {
  const [teams, setTeams] = useState<any[]>([]);
  const [championships, setChampionships] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  // Form State
  const [newName, setNewName] = useState('');
  const [selectedChampId, setSelectedChampId] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      // Buscar Campeonatos para o Select
      const champSnap = await getDocs(collection(db, 'championships'));
      const champList = champSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setChampionships(champList);

      // Buscar Times
      const qTeams = query(collection(db, 'teams'), orderBy('createdAt', 'desc'));
      const teamSnap = await getDocs(qTeams);
      setTeams(teamSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !selectedChampId) {
      alert('Preencha o nome do time e selecione um campeonato.');
      return;
    }

    try {
      const selectedChamp = championships.find(c => c.id === selectedChampId);

      await addDoc(collection(db, 'teams'), {
        name: newName,
        championshipId: selectedChampId,
        championshipName: selectedChamp?.name || 'N/A',
        createdAt: serverTimestamp(),
      });

      setNewName('');
      setIsCreating(false);
      fetchData();
    } catch (error) {
      console.error(error);
      alert('Erro ao cadastrar time.');
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
            <Users className="h-8 w-8 text-blue-600" />
            Times
          </h1>
          <p className="text-slate-500 font-medium">Cadastre e gerencie as equipes dos torneios.</p>
        </div>
        <Button onClick={() => setIsCreating(!isCreating)} className="bg-blue-600 shadow-lg shadow-blue-200">
          <Plus className="mr-2 h-4 w-4" /> Novo Time
        </Button>
      </div>

      {isCreating && (
        <Card className="border-2 border-blue-100 bg-slate-50">
          <CardHeader>
            <CardTitle className="text-sm font-bold uppercase text-slate-500">Novo Cadastro de Equipe</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-1">
                <Input
                  placeholder="Nome do Time (ex: Real Madrid)"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="bg-white"
                />
              </div>
              <div className="md:col-span-1">
                <Select onValueChange={setSelectedChampId} value={selectedChampId}>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Selecionar Campeonato" />
                  </SelectTrigger>
                  <SelectContent>
                    {championships.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="bg-blue-600">SALVAR TIME</Button>
            </form>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {teams.map((team) => (
            <Card key={team.id} className="hover:shadow-md transition-shadow border-slate-200">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-400">
                    {team.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{team.name}</h3>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Trophy className="h-3 w-3 text-amber-500" />
                      {team.championshipName}
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="text-slate-400">
                  <Search className="h-4 w-4 mr-2" /> Detalhes
                </Button>
              </CardContent>
            </Card>
          ))}

          {teams.length === 0 && (
            <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed">
              <p className="text-slate-400">Nenhum time cadastrado ainda.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
