'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { db } from '@/src/lib/firebase/client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Swords, Plus, Loader2, Calendar, MapPin, Clock } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export default function MatchesAdminPage() {
  const [matches, setMatches] = useState<any[]>([]);
  const [championships, setChampionships] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  // Form State
  const [selectedChampId, setSelectedChampId] = useState('');
  const [teamAId, setTeamAId] = useState('');
  const [teamBId, setTeamBId] = useState('');
  const [matchDate, setMatchDate] = useState('');
  const [matchLocation, setMatchLocation] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const champSnap = await getDocs(collection(db, 'championships'));
      setChampionships(champSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      const teamSnap = await getDocs(collection(db, 'teams'));
      setTeams(teamSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      const qMatches = query(collection(db, 'matches'), orderBy('scheduledDate', 'asc'));
      const matchSnap = await getDocs(qMatches);
      setMatches(matchSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
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
    if (!selectedChampId || !teamAId || !teamBId || !matchDate || teamAId === teamBId) {
      alert('Preencha todos os campos corretamente. Os times devem ser diferentes.');
      return;
    }

    try {
      const champ = championships.find(c => c.id === selectedChampId);
      const teamA = teams.find(t => t.id === teamAId);
      const teamB = teams.find(t => t.id === teamBId);

      await addDoc(collection(db, 'matches'), {
        championshipId: selectedChampId,
        championshipName: champ?.name,
        teamAId,
        teamAName: teamA?.name,
        teamBId,
        teamBName: teamB?.name,
        scoreA: 0,
        scoreB: 0,
        status: 'SCHEDULED', // SCHEDULED, LIVE, FINISHED
        location: matchLocation || 'Campo Principal',
        scheduledDate: new Date(matchDate),
        createdAt: serverTimestamp(),
      });

      setIsCreating(false);
      fetchData();
    } catch (error) {
      console.error(error);
      alert('Erro ao agendar partida.');
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
            <Swords className="h-8 w-8 text-red-600" />
            Partidas
          </h1>
          <p className="text-slate-500 font-medium">Agendamento de jogos e tabela.</p>
        </div>
        <Button onClick={() => setIsCreating(!isCreating)} className="bg-red-600 shadow-lg shadow-red-200">
          <Plus className="mr-2 h-4 w-4" /> Nova Partida
        </Button>
      </div>

      {isCreating && (
        <Card className="border-2 border-red-100 bg-red-50/20">
          <CardHeader>
            <CardTitle className="text-sm font-bold uppercase text-red-600">Configurar Confronto</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Select onValueChange={setSelectedChampId}>
                  <SelectTrigger className="bg-white"><SelectValue placeholder="Campeonato" /></SelectTrigger>
                  <SelectContent>{championships.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
                <Select onValueChange={setTeamAId}>
                  <SelectTrigger className="bg-white"><SelectValue placeholder="Time A (Mandante)" /></SelectTrigger>
                  <SelectContent>{teams.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent>
                </Select>
                <Select onValueChange={setTeamBId}>
                  <SelectTrigger className="bg-white"><SelectValue placeholder="Time B (Visitante)" /></SelectTrigger>
                  <SelectContent>{teams.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input type="datetime-local" value={matchDate} onChange={(e) => setMatchDate(e.target.value)} className="bg-white" />
                <Input placeholder="Local (ex: Arena Principal)" value={matchLocation} onChange={(e) => setMatchLocation(e.target.value)} className="bg-white" />
              </div>
              <Button type="submit" className="w-full bg-red-600 h-12 text-lg font-bold">AGENDAR JOGO</Button>
            </form>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-red-600" />
        </div>
      ) : (
        <div className="space-y-4">
          {matches.map((match) => (
            <Card key={match.id} className="border-slate-200">
              <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex-1 text-center md:text-right">
                  <p className="text-2xl font-black text-slate-900">{match.teamAName}</p>
                </div>

                <div className="flex items-center gap-4 bg-slate-100 px-6 py-2 rounded-2xl">
                   <span className="text-3xl font-black text-slate-900">{match.scoreA}</span>
                   <span className="text-slate-400 font-bold">VS</span>
                   <span className="text-3xl font-black text-slate-900">{match.scoreB}</span>
                </div>

                <div className="flex-1 text-center md:text-left">
                  <p className="text-2xl font-black text-slate-900">{match.teamBName}</p>
                </div>

                <div className="flex flex-col items-center md:items-end gap-1 min-w-[150px]">
                  <Badge variant={match.status === 'LIVE' ? 'destructive' : 'outline'} className={match.status === 'LIVE' ? 'animate-pulse' : ''}>
                    {match.status}
                  </Badge>
                  <div className="flex items-center gap-1 text-[10px] text-slate-500 font-bold">
                    <Calendar className="h-3 w-3" />
                    {match.scheduledDate?.toDate().toLocaleDateString('pt-BR')}
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-slate-500 font-bold">
                    <Clock className="h-3 w-3" />
                    {match.scheduledDate?.toDate().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {matches.length === 0 && (
            <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed">
              <p className="text-slate-400">Nenhuma partida agendada.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
