'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { db } from '@/src/lib/firebase/client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { UserCircle, Plus, Loader2, Shirt, Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

export default function AthletesAdminPage() {
  const [athletes, setAthletes] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  // Form State
  const [fullName, setFullName] = useState('');
  const [number, setNumber] = useState('');
  const [selectedTeamId, setSelectedTeamId] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      // Buscar Times para o Select
      const teamSnap = await getDocs(collection(db, 'teams'));
      setTeams(teamSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      // Buscar Atletas
      const qAthletes = query(collection(db, 'athletes'), orderBy('createdAt', 'desc'));
      const athleteSnap = await getDocs(qAthletes);
      setAthletes(athleteSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
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
    if (!fullName.trim() || !selectedTeamId || !number) {
      alert('Preencha todos os campos.');
      return;
    }

    try {
      const selectedTeam = teams.find(t => t.id === selectedTeamId);

      await addDoc(collection(db, 'athletes'), {
        fullName,
        number: parseInt(number),
        teamId: selectedTeamId,
        teamName: selectedTeam?.name || 'N/A',
        status: 'ACTIVE',
        createdAt: serverTimestamp(),
      });

      setFullName('');
      setNumber('');
      setIsCreating(false);
      fetchData();
    } catch (error) {
      console.error(error);
      alert('Erro ao cadastrar atleta.');
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
            <UserCircle className="h-8 w-8 text-emerald-600" />
            Atletas
          </h1>
          <p className="text-slate-500 font-medium">Inscrição de jogadores e numeração.</p>
        </div>
        <Button onClick={() => setIsCreating(!isCreating)} className="bg-emerald-600 shadow-lg shadow-emerald-200">
          <Plus className="mr-2 h-4 w-4" /> Novo Atleta
        </Button>
      </div>

      {isCreating && (
        <Card className="border-2 border-emerald-100 bg-emerald-50/30">
          <CardHeader>
            <CardTitle className="text-sm font-bold uppercase text-emerald-600">Ficha de Inscrição</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <Input
                  placeholder="Nome Completo"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="bg-white"
                />
              </div>
              <div className="md:col-span-1">
                <Input
                  type="number"
                  placeholder="Nº Camisa"
                  value={number}
                  onChange={(e) => setNumber(e.target.value)}
                  className="bg-white"
                />
              </div>
              <div className="md:col-span-1">
                <Select onValueChange={setSelectedTeamId} value={selectedTeamId}>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Selecionar Time" />
                  </SelectTrigger>
                  <SelectContent>
                    {teams.map(t => (
                      <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="bg-emerald-600 md:col-span-4 h-12 text-lg font-bold">CADASTRAR ATLETA</Button>
            </form>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {athletes.map((athlete) => (
            <Card key={athlete.id} className="hover:shadow-md transition-shadow border-slate-200 overflow-hidden">
              <div className="h-1 bg-emerald-500" />
              <CardContent className="p-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-emerald-100 rounded-full flex items-center justify-center font-bold text-emerald-700 relative">
                    <Shirt className="h-5 w-5 opacity-20 absolute" />
                    <span className="relative z-10">{athlete.number}</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 leading-tight">{athlete.fullName}</h3>
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-1">{athlete.teamName}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="text-slate-400">
                  <Search className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}

          {athletes.length === 0 && (
            <div className="col-span-full text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed">
              <p className="text-slate-400">Nenhum atleta inscrito no momento.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
