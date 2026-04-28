'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { db } from '@/src/lib/firebase/client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Trophy, Plus, Loader2, Calendar, LayoutGrid, ArrowLeft, Palette, Image as ImageIcon, Check, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { sanitizeData } from "@/src/lib/utils";
import { AdminPageHeader } from '@/src/modules/admin/components/AdminPageHeader';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';

export default function ChampionshipsAdminPage() {
  const [championships, setChampionships] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');

  // White Label State
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [selectedChamp, setSelectedChamp] = useState<any>(null);
  const [wlConfig, setWlConfig] = useState({
    primaryColor: '#FACC15',
    secondaryColor: '#0B0C0E',
    logoUrl: '',
    bannerUrl: ''
  });
  const [savingConfig, setSavingConfig] = useState(false);

  const fetchChampionships = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'campeonatos'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      setChampionships(snap.docs.map(doc => sanitizeData({ id: doc.id, ...doc.data() })));
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
      await addDoc(collection(db, 'campeonatos'), {
        name: newName,
        status: 'OPEN',
        createdAt: serverTimestamp(),
        startDate: new Date(),
        primaryColor: '#FACC15',
        secondaryColor: '#0B0C0E'
      });
      setNewName('');
      setIsCreating(false);
      fetchChampionships();
    } catch (error) {
      toast.error('Erro ao criar campeonato. Verifique as permissões.');
    }
  };

  const openConfig = (champ: any) => {
    setSelectedChamp(champ);
    setWlConfig({
      primaryColor: champ.primaryColor || '#FACC15',
      secondaryColor: champ.secondaryColor || '#0B0C0E',
      logoUrl: champ.logoUrl || '',
      bannerUrl: champ.bannerUrl || ''
    });
    setShowConfigModal(true);
  };

  const saveConfig = async () => {
    if (!selectedChamp) return;
    setSavingConfig(true);
    try {
      const { doc, updateDoc } = await import('firebase/firestore');
      await updateDoc(doc(db, 'campeonatos', selectedChamp.id), {
        ...wlConfig,
        updatedAt: serverTimestamp()
      });
      setShowConfigModal(false);
      fetchChampionships();
    } catch (e) {
      toast.error('Erro ao salvar configuração.');
    } finally {
      setSavingConfig(false);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'OPEN' ? 'FINISHED' : 'OPEN';
      const { doc, updateDoc } = await import('firebase/firestore');
      await updateDoc(doc(db, 'campeonatos', id), {
        status: newStatus,
        updatedAt: serverTimestamp()
      });
      fetchChampionships();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast.error('Erro ao atualizar status.');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <AdminPageHeader
        title="Campeonatos"
        subtitle="Gerencie suas competições, ligas e torneios oficiais."
        action={
          <div className="flex gap-2">
            <Button variant="outline" className="border-slate-800 text-slate-400" asChild>
                <Link href="/admin"><ArrowLeft className="mr-2 h-4 w-4" /> Voltar</Link>
            </Button>
            <Button onClick={() => setIsCreating(!isCreating)} className="bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg shadow-red-900/20">
              <Plus className="mr-2 h-4 w-4" /> Novo Campeonato
            </Button>
          </div>
        }
      />

      {isCreating && (
        <Card className="bg-slate-900 border-amber-500/30 rounded-3xl overflow-hidden shadow-2xl">
          <CardHeader className="border-b border-slate-800 p-6">
            <CardTitle className="text-sm font-black uppercase tracking-widest text-amber-500">Configurar Nova Competição</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleCreate} className="flex gap-4">
              <Input
                placeholder="Ex: Copa Verão 2024"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="bg-slate-950 border-slate-800 text-white rounded-xl h-12 flex-1"
              />
              <Button type="submit" className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black uppercase px-8 rounded-xl tracking-widest">CRIAR</Button>
            </form>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-40 gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-amber-500" />
          <p className="text-slate-500 font-medium">Carregando campeonatos...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {championships.map((champ) => (
            <Card
              key={champ.id}
              className="bg-zinc-900 border-slate-800 rounded-3xl overflow-hidden hover:border-amber-500/50 transition-all group cursor-pointer shadow-xl relative"
            >
              <CardContent className="p-6">
                <Link href={`/admin/campeonatos/${champ.id}`} className="absolute inset-0 z-0" />
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-6">
                    <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl group-hover:bg-amber-500 group-hover:text-slate-950 transition-all duration-300">
                      <LayoutGrid className="h-6 w-6 text-amber-500 group-hover:text-slate-950" />
                    </div>
                    <Badge className={`
                      px-3 py-1 rounded-full font-black text-[10px] tracking-widest
                      ${champ.status === 'OPEN' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}
                    `}>
                      {champ.status === 'OPEN' ? 'ABERTO' : 'ENCERRADO'}
                    </Badge>
                  </div>
                  <h3 className="text-xl font-black text-white mb-2 uppercase tracking-tight group-hover:text-amber-500 transition-colors italic">{champ.name}</h3>
                  <div className="flex items-center gap-2 text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                    <Calendar className="h-3 w-3" />
                    <span>Criado em {champ.createdAt?.toDate().toLocaleDateString('pt-BR')}</span>
                  </div>

                  <div className="mt-6 pt-6 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleToggleStatus(champ.id, champ.status);
                          }}
                          className={`text-[9px] font-black uppercase tracking-widest px-3 h-8 rounded-lg border relative z-20 ${
                            champ.status === 'OPEN'
                            ? 'border-rose-500/20 text-rose-500 hover:bg-rose-500 hover:text-white'
                            : 'border-emerald-500/20 text-emerald-500 hover:bg-emerald-500 hover:text-white'
                          }`}
                        >
                          {champ.status === 'OPEN' ? 'Encerrar' : 'Reabrir'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            openConfig(champ);
                          }}
                          className="text-[9px] font-black uppercase tracking-widest px-3 h-8 rounded-lg border-zinc-800 bg-zinc-950 text-zinc-400 hover:bg-zinc-800 hover:text-white relative z-20"
                        >
                          <Palette className="w-3 h-3 mr-1.5" /> Tema
                        </Button>
                    </div>
                    <div className="flex items-center gap-1.5 text-zinc-600 group-hover:text-blue-500 transition-colors">
                        <span className="text-[9px] font-black uppercase tracking-wider">Detalhes</span>
                        <ArrowLeft className="w-3 h-3 rotate-180" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {championships.length === 0 && (
            <div className="col-span-full text-center py-20 bg-slate-900/50 rounded-3xl border-2 border-dashed border-slate-800">
               <Trophy className="h-12 w-12 text-slate-700 mx-auto mb-4" />
               <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Nenhum campeonato encontrado.</p>
            </div>
          )}
        </div>
      )}

      {/* Modal de Configuração White Label */}
      <Dialog open={showConfigModal} onOpenChange={setShowConfigModal}>
        <DialogContent className="max-w-2xl bg-slate-900 border-slate-800 text-white rounded-[2rem]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black italic uppercase tracking-tighter flex items-center gap-2">
              <Palette className="w-6 h-6 text-red-600" />
              Personalização (White Label)
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
             <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Cor Primária</label>
                   <div className="flex gap-2">
                      <Input
                        type="color"
                        value={wlConfig.primaryColor}
                        onChange={e => setWlConfig({...wlConfig, primaryColor: e.target.value})}
                        className="w-12 h-12 p-1 bg-slate-950 border-slate-800 rounded-xl"
                      />
                      <Input
                        value={wlConfig.primaryColor}
                        onChange={e => setWlConfig({...wlConfig, primaryColor: e.target.value})}
                        className="bg-slate-950 border-slate-800 text-white rounded-xl h-12"
                      />
                   </div>
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Cor Secundária (Texto/Fundo)</label>
                   <div className="flex gap-2">
                      <Input
                        type="color"
                        value={wlConfig.secondaryColor}
                        onChange={e => setWlConfig({...wlConfig, secondaryColor: e.target.value})}
                        className="w-12 h-12 p-1 bg-slate-950 border-slate-800 rounded-xl"
                      />
                      <Input
                        value={wlConfig.secondaryColor}
                        onChange={e => setWlConfig({...wlConfig, secondaryColor: e.target.value})}
                        className="bg-slate-950 border-slate-800 text-white rounded-xl h-12"
                      />
                   </div>
                </div>
             </div>

             <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">URL da Logo (PNG Transparente)</label>
                <div className="flex gap-4">
                   <Input
                      placeholder="https://suaimagem.com/logo.png"
                      value={wlConfig.logoUrl}
                      onChange={e => setWlConfig({...wlConfig, logoUrl: e.target.value})}
                      className="bg-slate-950 border-slate-800 text-white rounded-xl h-12 flex-1"
                   />
                   {wlConfig.logoUrl && (
                      <div className="w-12 h-12 bg-white rounded-xl p-1 flex items-center justify-center border border-slate-800">
                         <img src={wlConfig.logoUrl} alt="Logo Preview" className="max-w-full max-h-full object-contain" />
                      </div>
                   )}
                </div>
             </div>

             <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">URL do Banner de Capa</label>
                <div className="flex flex-col gap-4">
                   <Input
                      placeholder="https://suaimagem.com/banner.jpg"
                      value={wlConfig.bannerUrl}
                      onChange={e => setWlConfig({...wlConfig, bannerUrl: e.target.value})}
                      className="bg-slate-950 border-slate-800 text-white rounded-xl h-12"
                   />
                   {wlConfig.bannerUrl && (
                      <div className="w-full h-24 rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
                         <img src={wlConfig.bannerUrl} alt="Banner Preview" className="w-full h-full object-cover" />
                      </div>
                   )}
                </div>
             </div>

             <div className="bg-slate-950/50 border border-slate-800 p-4 rounded-2xl">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                   <ImageIcon className="w-3 h-3 text-red-600" /> Preview do Tema
                </h4>
                <div className="flex gap-4">
                   <div
                    className="flex-1 h-12 rounded-xl flex items-center justify-center font-black uppercase text-[10px] tracking-widest shadow-xl"
                    style={{ backgroundColor: wlConfig.primaryColor, color: wlConfig.secondaryColor }}
                   >
                     Botão Primário
                   </div>
                   <div
                    className="flex-1 h-12 rounded-xl flex items-center justify-center font-black uppercase text-[10px] tracking-widest border"
                    style={{ borderColor: wlConfig.primaryColor, color: wlConfig.primaryColor }}
                   >
                     Botão Outline
                   </div>
                </div>
             </div>
          </div>

          <DialogFooter className="gap-3 mt-6">
             <Button variant="ghost" onClick={() => setShowConfigModal(false)} className="text-slate-400 hover:text-white uppercase font-black text-[10px]">
                DESCARTAR
             </Button>
             <Button
                onClick={saveConfig}
                disabled={savingConfig}
                className="bg-red-600 hover:bg-red-700 text-white font-black px-10 rounded-xl h-12 shadow-lg shadow-red-900/20 uppercase text-[10px] tracking-widest"
             >
                {savingConfig ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check className="mr-2 h-4 w-4" />}
                APLICAR TEMA
             </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
