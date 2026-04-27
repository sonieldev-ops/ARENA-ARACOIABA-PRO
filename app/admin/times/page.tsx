'use client';

import { useState, useEffect } from 'react';
import { db, storage } from '@/src/lib/firebase/client';
import { collection, getDocs, addDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Users, Plus, Loader2, Trophy, Search, ArrowLeft, Trash2, Pencil, Image as ImageIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { sanitizeData } from "@/src/lib/utils";
import { AdminPageHeader } from '@/src/modules/admin/components/AdminPageHeader';
import Link from 'next/link';

export default function TeamsAdminPage() {
  const [teams, setTeams] = useState<any[]>([]);
  const [championships, setChampionships] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  
  const [newName, setNewName] = useState('');
  const [owner, setOwner] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [selectedChampId, setSelectedChampId] = useState('');
  const [editingTeam, setEditingTeam] = useState<any>(null);

  const [uploading, setUploading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const champSnap = await getDocs(collection(db, 'campeonatos'));
      setChampionships(champSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      const qTeams = query(collection(db, 'times'), orderBy('createdAt', 'desc'));
      const teamSnap = await getDocs(qTeams);
      setTeams(teamSnap.docs.map(doc => sanitizeData({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileRef = ref(storage, `teams/${Date.now()}-${file.name}`);
      await uploadBytes(fileRef, file);
      const url = await getDownloadURL(fileRef);
      setLogoUrl(url);
    } catch (error) {
      console.error('Erro no upload:', error);
      alert('Erro ao fazer upload da logo.');
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !selectedChampId) return;

    try {
      const champ = championships.find(c => c.id === selectedChampId);
      
      const teamData = {
        name: newName,
        owner: owner,
        logoUrl: logoUrl || '',
        championshipId: selectedChampId,
        championshipName: champ?.name,
        updatedAt: serverTimestamp(),
      };

      if (editingTeam) {
        const { doc, updateDoc } = await import('firebase/firestore');
        await updateDoc(doc(db, 'times', editingTeam.id), teamData);
      } else {
        await addDoc(collection(db, 'times'), {
          ...teamData,
          createdAt: serverTimestamp(),
        });
      }

      setNewName('');
      setOwner('');
      setLogoUrl('');
      setEditingTeam(null);
      setIsCreating(false);
      fetchData();
    } catch (error) {
      console.error(error);
      alert('Erro ao salvar time.');
    }
  };

  const startEdit = (team: any) => {
    setEditingTeam(team);
    setNewName(team.name);
    setOwner(team.owner || '');
    setLogoUrl(team.logoUrl || '');
    setSelectedChampId(team.championshipId);
    setIsCreating(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta equipe?')) return;
    try {
      const { doc, deleteDoc } = await import('firebase/firestore');
      await deleteDoc(doc(db, 'times', id));
      fetchData();
    } catch (error) {
      console.error('Erro ao excluir equipe:', error);
      alert('Erro ao excluir equipe.');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <AdminPageHeader
        title="Equipes e Times"
        subtitle="Gerencie os clubes e seleções participantes dos torneios."
        action={
          <div className="flex gap-2">
            <Button variant="outline" className="border-slate-800 text-slate-400" asChild>
                <Link href="/admin"><ArrowLeft className="mr-2 h-4 w-4" /> Voltar</Link>
            </Button>
            <Button 
              onClick={() => {
                if (isCreating) {
                  setEditingTeam(null);
                  setNewName('');
                  setOwner('');
                  setLogoUrl('');
                }
                setIsCreating(!isCreating);
              }} 
              className="bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg shadow-red-900/20"
            >
              {isCreating ? 'Cancelar' : <><Plus className="mr-2 h-4 w-4" /> Nova Equipe</>}
            </Button>
          </div>
        }
      />

      {isCreating && (
        <Card className="bg-slate-900 border-blue-600/30 rounded-3xl overflow-hidden shadow-2xl">
          <CardHeader className="border-b border-slate-800 p-6">
            <CardTitle className="text-sm font-black uppercase tracking-widest text-blue-500">Cadastrar Novo Time</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleCreate} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest px-1">Nome da Equipe</label>
                  <Input
                    placeholder="Ex: Santos FC"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="bg-slate-950 border-slate-800 text-white rounded-xl h-12"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest px-1">Dono / Responsável</label>
                  <Input
                    placeholder="Ex: João Silva"
                    value={owner}
                    onChange={(e) => setOwner(e.target.value)}
                    className="bg-slate-950 border-slate-800 text-white rounded-xl h-12"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest px-1">Vincular ao Campeonato</label>
                  <Select onValueChange={setSelectedChampId} value={selectedChampId}>
                    <SelectTrigger className="bg-slate-950 border-slate-800 text-white rounded-xl h-12">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-950 border-slate-800 text-white">
                      {championships.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest px-1">Logo da Equipe (Escudo)</label>
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 flex gap-2">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="bg-slate-950 border-slate-800 text-white rounded-xl h-12 file:bg-blue-600 file:text-white file:border-none file:h-full file:px-4 file:mr-4 file:font-black file:uppercase file:text-[10px] cursor-pointer"
                      />
                      {uploading && (
                        <div className="flex items-center gap-2 text-[10px] font-black text-blue-500 animate-pulse">
                          <Loader2 className="w-3 h-3 animate-spin" /> ENVIANDO...
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 text-slate-600 text-[10px] font-bold">OU</div>

                    <Input
                      placeholder="URL do Logo (opcional)"
                      value={logoUrl}
                      onChange={(e) => setLogoUrl(e.target.value)}
                      className="bg-slate-950 border-slate-800 text-white rounded-xl h-12 flex-1"
                    />

                    {logoUrl && (
                      <div className="h-12 w-12 rounded-xl overflow-hidden border border-slate-800 shrink-0">
                        <img src={logoUrl} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest h-14 rounded-2xl shadow-xl shadow-blue-900/20">
                SALVAR EQUIPE
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-40 gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
          <p className="text-slate-500 font-medium">Carregando equipes...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((team) => (
            <Card key={team.id} className="bg-slate-900 border-slate-800 rounded-3xl overflow-hidden hover:border-blue-500/50 transition-all group shadow-xl">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-center font-black text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 overflow-hidden">
                    {team.logoUrl ? (
                      <img src={team.logoUrl} alt={team.name} className="w-full h-full object-cover" />
                    ) : (
                      team.name?.substring(0, 2).toUpperCase()
                    )}
                  </div>
                  <div>
                    <h3 className="font-black text-white text-lg leading-tight uppercase italic group-hover:text-blue-500 transition-colors">{team.name}</h3>
                    <div className="flex flex-col gap-0.5 mt-1">
                      <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        <Trophy className="h-3 w-3 text-amber-500" />
                        {team.championshipName || 'Sem Campeonato'}
                      </div>
                      {team.owner && (
                        <div className="text-[9px] font-black text-blue-400 uppercase tracking-wider">
                          Dono: {team.owner}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => startEdit(team)}
                    className="text-slate-600 hover:text-blue-500 hover:bg-blue-500/10 rounded-xl"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleDelete(team.id)}
                    className="text-slate-600 hover:text-red-500 hover:bg-red-500/10 rounded-xl"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {teams.length === 0 && (
            <div className="col-span-full text-center py-20 bg-slate-900/50 rounded-3xl border-2 border-dashed border-slate-800">
               <Users className="h-12 w-12 text-slate-700 mx-auto mb-4" />
               <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Nenhuma equipe cadastrada.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
