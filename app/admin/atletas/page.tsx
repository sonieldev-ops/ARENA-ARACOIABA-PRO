'use client';

import { useState, useEffect } from 'react';
import { db, storage } from '@/src/lib/firebase/client';
import { collection, getDocs, addDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { UserCircle, Plus, Loader2, Shirt, Search, ArrowLeft, Trash2, Pencil, Image as ImageIcon, FileUp, Download, AlertCircle, CheckCircle2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { writeBatch, doc } from 'firebase/firestore';
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

export default function AthletesAdminPage() {
  const [athletes, setAthletes] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  // Form State
  const [fullName, setFullName] = useState('');
  const [number, setNumber] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [editingAthlete, setEditingAthlete] = useState<any>(null);

  const [uploading, setUploading] = useState(false);

  // CSV Import State
  const [csvPreview, setCsvPreview] = useState<any[]>([]);
  const [showCsvModal, setShowCsvModal] = useState(false);
  const [importingCsv, setImportingCsv] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const teamSnap = await getDocs(collection(db, 'times'));
      setTeams(teamSnap.docs.map(doc => sanitizeData({ id: doc.id, ...doc.data() })));

      const qAthletes = query(collection(db, 'atletas'), orderBy('createdAt', 'desc'));
      const athleteSnap = await getDocs(qAthletes);
      setAthletes(athleteSnap.docs.map(doc => sanitizeData({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileRef = ref(storage, `athletes/${Date.now()}-${file.name}`);
      await uploadBytes(fileRef, file);
      const url = await getDownloadURL(fileRef);
      setImageUrl(url);
    } catch (error) {
      console.error('Erro no upload:', error);
      alert('Erro ao fazer upload da imagem.');
    } finally {
      setUploading(false);
    }
  };

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

      const parsedData = lines.slice(1)
        .filter(line => line.trim() !== '')
        .map((line, index) => {
          const values = line.split(',').map(v => v.trim());
          const item: any = { id: index };
          headers.forEach((header, i) => {
            item[header] = values[i];
          });

          // Validação básica
          const errors = [];
          if (!item.nome) errors.push('Nome ausente');
          if (!item.numero) errors.push('Número ausente');
          if (!item.time) errors.push('Time ausente');

          return { ...item, errors };
        });

      setCsvPreview(parsedData);
      setShowCsvModal(true);
    };
    reader.readAsText(file);
    // Limpar input
    e.target.value = '';
  };

  const processCsvImport = async () => {
    if (!csvPreview.length) return;

    setImportingCsv(true);
    const batch = writeBatch(db);
    let successCount = 0;
    let errorCount = 0;

    try {
      for (const item of csvPreview) {
        if (item.errors.length > 0) {
          errorCount++;
          continue;
        }

        const team = teams.find(t => t.name.toLowerCase() === item.time.toLowerCase());
        if (!team) {
          item.errors.push(`Time "${item.time}" não encontrado`);
          errorCount++;
          continue;
        }

        // Verificar duplicidade de número no mesmo time
        const duplicate = athletes.find(a => a.teamId === team.id && a.number === parseInt(item.numero));
        if (duplicate) {
          item.errors.push(`Número ${item.numero} já existe no ${team.name}`);
          errorCount++;
          continue;
        }

        const athleteRef = doc(collection(db, 'atletas'));
        batch.set(athleteRef, {
          fullName: item.nome,
          number: parseInt(item.numero),
          position: item.posicao || 'Não informada',
          teamId: team.id,
          teamName: team.name,
          status: 'ACTIVE',
          goals: 0,
          yellowCards: 0,
          redCards: 0,
          document: item.documento || '',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        successCount++;
      }

      if (successCount > 0) {
        await batch.commit();
        toast.success(`${successCount} atletas importados com sucesso!`);
        fetchData();
        if (errorCount === 0) setShowCsvModal(false);
      } else {
        toast.error('Nenhum atleta pôde ser importado. Verifique os erros.');
      }
    } catch (error) {
      console.error(error);
      toast.error('Erro durante a importação.');
    } finally {
      setImportingCsv(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !selectedTeamId || !number) {
      alert('Preencha todos os campos.');
      return;
    }

    try {
      const selectedTeam = teams.find(t => t.id === selectedTeamId);

      const athleteData = {
        fullName,
        number: parseInt(number),
        imageUrl: imageUrl || '',
        teamId: selectedTeamId,
        teamName: selectedTeam?.name || 'N/A',
        status: 'ACTIVE',
        goals: 0,
        yellowCards: 0,
        redCards: 0,
        updatedAt: serverTimestamp()
      };

      if (editingAthlete) {
        const { doc, updateDoc } = await import('firebase/firestore');
        await updateDoc(doc(db, 'atletas', editingAthlete.id), athleteData);
      } else {
        await addDoc(collection(db, 'atletas'), {
          ...athleteData,
          createdAt: serverTimestamp()
        });
      }

      setFullName('');
      setNumber('');
      setImageUrl('');
      setEditingAthlete(null);
      setIsCreating(false);
      fetchData();
    } catch (error) {
      console.error(error);
      alert('Erro ao salvar atleta.');
    }
  };

  const startEdit = (athlete: any) => {
    setEditingAthlete(athlete);
    setFullName(athlete.fullName);
    setNumber(athlete.number.toString());
    setImageUrl(athlete.imageUrl || '');
    setSelectedTeamId(athlete.teamId);
    setIsCreating(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja excluir este atleta?')) return;
    try {
      const { doc, deleteDoc } = await import('firebase/firestore');
      await deleteDoc(doc(db, 'atletas', id));
      fetchData();
    } catch (error) {
      console.error('Erro ao excluir:', error);
      alert('Erro ao excluir atleta.');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <AdminPageHeader
        title="Atletas e Jogadores"
        subtitle="Inscrição oficial e gerenciamento de numeração dos atletas."
        action={
          <div className="flex gap-2">
            <Button variant="outline" className="border-slate-800 text-slate-400" asChild>
                <Link href="/admin"><ArrowLeft className="mr-2 h-4 w-4" /> Voltar</Link>
            </Button>

            <div className="relative">
              <Input
                type="file"
                accept=".csv"
                onChange={handleCsvUpload}
                className="absolute inset-0 opacity-0 cursor-pointer z-10"
              />
              <Button variant="outline" className="border-emerald-500/50 text-emerald-500 hover:bg-emerald-500/10">
                <FileUp className="mr-2 h-4 w-4" /> Importar CSV
              </Button>
            </div>

            <Button
              onClick={() => {
                if (isCreating) {
                  setEditingAthlete(null);
                  setFullName('');
                  setNumber('');
                  setImageUrl('');
                }
                setIsCreating(!isCreating);
              }} 
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-900/20"
            >
              {isCreating ? 'Cancelar' : <><Plus className="mr-2 h-4 w-4" /> Novo Atleta</>}
            </Button>
          </div>
        }
      />

      <Dialog open={showCsvModal} onOpenChange={setShowCsvModal}>
        <DialogContent className="max-w-4xl bg-slate-900 border-slate-800 text-white rounded-[2rem]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black italic uppercase tracking-tighter flex items-center gap-2">
              <FileUp className="w-6 h-6 text-emerald-500" />
              Prévia da Importação
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Verifique os dados abaixo antes de confirmar a inscrição em massa.
            </DialogDescription>
          </DialogHeader>

          <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden mt-4">
             <div className="grid grid-cols-5 p-3 bg-slate-900/50 text-[10px] font-black uppercase tracking-widest text-slate-500 border-b border-slate-800">
                <span>Nome</span>
                <span>Nº</span>
                <span>Posição</span>
                <span>Time</span>
                <span className="text-right">Status</span>
             </div>
             <ScrollArea className="h-[300px]">
                {csvPreview.map((item, i) => (
                  <div key={i} className="grid grid-cols-5 p-3 border-b border-slate-800/50 text-sm items-center hover:bg-white/5 transition-colors">
                    <span className="font-bold truncate pr-2">{item.nome}</span>
                    <span className="text-emerald-500 font-mono">#{item.numero}</span>
                    <span className="text-slate-400 text-xs">{item.posicao || '-'}</span>
                    <span className="text-slate-300 font-medium truncate pr-2">{item.time}</span>
                    <div className="flex justify-end">
                       {item.errors.length > 0 ? (
                         <div className="group relative">
                           <AlertCircle className="w-5 h-5 text-red-500" />
                           <div className="absolute right-0 bottom-full mb-2 hidden group-hover:block bg-red-600 text-white text-[10px] p-2 rounded-lg whitespace-nowrap z-50">
                             {item.errors.join(', ')}
                           </div>
                         </div>
                       ) : (
                         <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                       )}
                    </div>
                  </div>
                ))}
             </ScrollArea>
          </div>

          <DialogFooter className="mt-6 gap-3">
             <Button variant="ghost" onClick={() => setShowCsvModal(false)} className="text-slate-400 hover:text-white">
                CANCELAR
             </Button>
             <Button
                onClick={processCsvImport}
                disabled={importingCsv || !csvPreview.some(i => i.errors.length === 0)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-8 rounded-xl h-12 shadow-lg shadow-emerald-900/20"
             >
                {importingCsv ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                CONFIRMAR IMPORTAÇÃO
             </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {isCreating && (
        <Card className="bg-slate-900 border-emerald-500/30 rounded-3xl overflow-hidden shadow-2xl">
          <CardHeader className="border-b border-slate-800 p-6">
            <CardTitle className="text-sm font-black uppercase tracking-widest text-emerald-500">Ficha de Inscrição</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleCreate} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest px-1">Nome Completo</label>
                  <Input
                    placeholder="Ex: Neymar Jr"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="bg-slate-950 border-slate-800 text-white rounded-xl h-12"
                  />
                </div>
                <div className="md:col-span-1 space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest px-1">Nº Camisa</label>
                  <Input
                    type="number"
                    placeholder="Ex: 10"
                    value={number}
                    onChange={(e) => setNumber(e.target.value)}
                    className="bg-slate-950 border-slate-800 text-white rounded-xl h-12"
                  />
                </div>
                <div className="md:col-span-1 space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest px-1">Equipe</label>
                  <Select onValueChange={setSelectedTeamId} value={selectedTeamId}>
                    <SelectTrigger className="bg-slate-950 border-slate-800 text-white rounded-xl h-12 w-full">
                      <SelectValue placeholder="Selecionar..." />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-950 border-slate-800 text-white">
                      {teams.map(t => (
                        <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-4 space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest px-1">Foto do Atleta</label>
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 flex gap-2">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="bg-slate-950 border-slate-800 text-white rounded-xl h-12 file:bg-emerald-600 file:text-white file:border-none file:h-full file:px-4 file:mr-4 file:font-black file:uppercase file:text-[10px] cursor-pointer"
                      />
                      {uploading && (
                        <div className="flex items-center gap-2 text-[10px] font-black text-emerald-500 animate-pulse">
                          <Loader2 className="w-3 h-3 animate-spin" /> ENVIANDO...
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 text-slate-600 text-[10px] font-bold">OU</div>

                    <Input
                      placeholder="URL da Imagem (opcional)"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      className="bg-slate-950 border-slate-800 text-white rounded-xl h-12 flex-1"
                    />

                    {imageUrl && (
                      <div className="h-12 w-12 rounded-xl overflow-hidden border border-slate-800 shrink-0">
                        <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-widest h-14 rounded-2xl shadow-xl shadow-emerald-900/20">
                FINALIZAR INSCRIÇÃO
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-40 gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-emerald-500" />
          <p className="text-slate-500 font-medium">Carregando atletas...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {athletes.map((athlete) => (
            <Card key={athlete.id} className="bg-slate-900 border-slate-800 rounded-3xl overflow-hidden hover:border-emerald-500/50 transition-all group shadow-xl">
              <div className="h-1 bg-emerald-500/30 group-hover:bg-emerald-500 transition-all" />
              <CardContent className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-center font-black text-emerald-500 relative group-hover:bg-emerald-500 group-hover:text-slate-950 transition-all duration-300 overflow-hidden">
                    {athlete.imageUrl ? (
                      <img src={athlete.imageUrl} alt={athlete.fullName} className="w-full h-full object-cover" />
                    ) : (
                      <>
                        <Shirt className="h-6 w-6 opacity-20 absolute" />
                        <span className="relative z-10 text-xl">{athlete.number}</span>
                      </>
                    )}
                  </div>
                  <div>
                    <h3 className="font-black text-white text-lg leading-tight uppercase italic group-hover:text-emerald-500 transition-colors">{athlete.fullName}</h3>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">{athlete.teamName}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => startEdit(athlete)}
                    className="text-slate-600 hover:text-emerald-500 hover:bg-emerald-500/10 rounded-xl"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleDelete(athlete.id)}
                    className="text-slate-600 hover:text-red-500 hover:bg-red-500/10 rounded-xl"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {athletes.length === 0 && (
            <div className="col-span-full text-center py-20 bg-slate-900/50 rounded-3xl border-2 border-dashed border-slate-800">
               <UserCircle className="h-12 w-12 text-slate-700 mx-auto mb-4" />
               <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Nenhum atleta inscrito.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
