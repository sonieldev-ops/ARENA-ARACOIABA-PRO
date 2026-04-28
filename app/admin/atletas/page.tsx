'use client';

import { useState, useEffect, useCallback } from 'react';
import { db, storage } from '@/src/lib/firebase/client';
import { collection, getDocs, addDoc, serverTimestamp, query, orderBy, Timestamp, writeBatch, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import Image from 'next/image';

interface Athlete {
  id: string;
  fullName: string;
  number: number;
  imageUrl?: string;
  teamId: string;
  teamName: string;
  status: string;
  goals: number;
  yellowCards: number;
  redCards: number;
  position?: string;
  document?: string;
  createdAt: Timestamp;
}

interface Team {
  id: string;
  name: string;
}

interface CsvItem {
  id: number;
  nome?: string;
  numero?: string;
  time?: string;
  posicao?: string;
  documento?: string;
  errors: string[];
  [key: string]: string | string[] | number | undefined; // Permite headers dinâmicos do CSV de forma segura
}

export default function AthletesAdminPage() {
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  // Form State
  const [fullName, setFullName] = useState('');
  const [number, setNumber] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [editingAthlete, setEditingAthlete] = useState<Athlete | null>(null);

  const [uploading, setUploading] = useState(false);

  // CSV Import State
  const [csvPreview, setCsvPreview] = useState<CsvItem[]>([]);
  const [showCsvModal, setShowCsvModal] = useState(false);
  const [importingCsv, setImportingCsv] = useState(false);

  const fetchData = useCallback(async () => {
    // Evita o erro de setState sincronamente no useEffect
    setLoading(true);
    try {
      const teamSnap = await getDocs(collection(db, 'times'));
      setTeams(teamSnap.docs.map(doc => sanitizeData({ id: doc.id, ...doc.data() }) as Team));

      const qAthletes = query(collection(db, 'atletas'), orderBy('createdAt', 'desc'));
      const athleteSnap = await getDocs(qAthletes);
      setAthletes(athleteSnap.docs.map(doc => sanitizeData({ id: doc.id, ...doc.data() }) as Athlete));
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      toast.error('Erro ao carregar dados.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchData]);

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
      toast.error('Erro ao fazer upload da imagem.');
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

      const parsedData: CsvItem[] = lines.slice(1)
        .filter(line => line.trim() !== '')
        .map((line, index) => {
          const values = line.split(',').map(v => v.trim());
          const item: CsvItem = { id: index, errors: [] };
          headers.forEach((header, i) => {
            item[header] = values[i];
          });

          // Validação básica
          if (!item.nome) item.errors.push('Nome ausente');
          if (!item.numero) item.errors.push('Número ausente');
          if (!item.time) item.errors.push('Time ausente');

          return item;
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

        const team = teams.find(t => t.name.toLowerCase() === item.time?.toLowerCase());
        if (!team) {
          item.errors.push(`Time "${item.time}" não encontrado`);
          errorCount++;
          continue;
        }

        // Verificar duplicidade de número no mesmo time
        const athleteNumber = parseInt(item.numero || '0');
        const duplicate = athletes.find(a => a.teamId === team.id && a.number === athleteNumber);
        if (duplicate) {
          item.errors.push(`Número ${item.numero} já existe no ${team.name}`);
          errorCount++;
          continue;
        }

        const athleteRef = doc(collection(db, 'atletas'));
        batch.set(athleteRef, {
          fullName: item.nome,
          number: athleteNumber,
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
      toast.error('Preencha todos os campos obrigatórios.');
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
        goals: editingAthlete?.goals || 0,
        yellowCards: editingAthlete?.yellowCards || 0,
        redCards: editingAthlete?.redCards || 0,
        updatedAt: serverTimestamp()
      };

      if (editingAthlete) {
        await updateDoc(doc(db, 'atletas', editingAthlete.id), athleteData);
        toast.success('Atleta atualizado com sucesso!');
      } else {
        await addDoc(collection(db, 'atletas'), {
          ...athleteData,
          createdAt: serverTimestamp()
        });
        toast.success('Atleta inscrito com sucesso!');
      }

      setFullName('');
      setNumber('');
      setImageUrl('');
      setSelectedTeamId('');
      setEditingAthlete(null);
      setIsCreating(false);
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error('Erro ao salvar atleta.');
    }
  };

  const startEdit = (athlete: Athlete) => {
    setEditingAthlete(athlete);
    setFullName(athlete.fullName);
    setNumber(athlete.number.toString());
    setImageUrl(athlete.imageUrl || '');
    setSelectedTeamId(athlete.teamId);
    setIsCreating(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente remover este atleta?')) return;
    try {
      await deleteDoc(doc(db, 'atletas', id));
      toast.success('Atleta removido.');
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error('Erro ao remover atleta.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 pb-32">
      <AdminPageHeader
        title="Gestão de Atletas"
        description="Controle de inscrições e banco de dados de jogadores"
        action={
          <div className="flex gap-2">
            <Button
              onClick={() => setIsCreating(!isCreating)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-widest px-6 rounded-2xl h-14 shadow-xl shadow-emerald-900/20"
            >
              {isCreating ? <ArrowLeft className="mr-2 h-5 w-5" /> : <Plus className="mr-2 h-5 w-5" />}
              {isCreating ? 'Voltar' : 'Novo Atleta'}
            </Button>

            <div className="relative">
              <input
                type="file"
                accept=".csv"
                onChange={handleCsvUpload}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <Button
                variant="outline"
                className="border-slate-800 bg-slate-900 text-slate-300 font-black uppercase tracking-widest px-6 rounded-2xl h-14 hover:bg-slate-800"
              >
                <FileUp className="mr-2 h-5 w-5" />
                Importar CSV
              </Button>
            </div>
          </div>
        }
      />

      {isCreating && (
        <Card className="bg-slate-900 border-slate-800 rounded-3xl overflow-hidden shadow-2xl border-t-4 border-t-emerald-500 animate-in fade-in slide-in-from-top-4 duration-500">
          <CardContent className="p-8">
            <form onSubmit={handleCreate} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
                <div className="md:col-span-3 space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest px-1">Nome Completo</label>
                  <Input
                    placeholder="Ex: João Silva"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="bg-slate-950 border-slate-800 text-white rounded-xl h-12 focus:ring-emerald-500"
                  />
                </div>
                <div className="md:col-span-1 space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest px-1">Nº Camisa</label>
                  <Input
                    type="number"
                    placeholder="10"
                    value={number}
                    onChange={(e) => setNumber(e.target.value)}
                    className="bg-slate-950 border-slate-800 text-white rounded-xl h-12"
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
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
                <div className="md:col-span-6 space-y-2">
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
                      <div className="h-12 w-12 rounded-xl overflow-hidden border border-slate-800 shrink-0 relative">
                        <Image src={imageUrl} alt="Preview" fill className="object-cover" unoptimized />
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-widest h-14 rounded-2xl shadow-xl shadow-emerald-900/20">
                {editingAthlete ? 'SALVAR ALTERAÇÕES' : 'FINALIZAR INSCRIÇÃO'}
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
                      <Image src={athlete.imageUrl} alt={athlete.fullName} fill className="object-cover" unoptimized />
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

      {/* CSV Preview Modal */}
      <Dialog open={showCsvModal} onOpenChange={setShowCsvModal}>
        <DialogContent className="max-w-4xl bg-slate-950 border-slate-800 text-white rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black uppercase italic tracking-tighter">Prévia da Importação</DialogTitle>
            <DialogDescription className="text-slate-400">Verifique os dados antes de confirmar a importação dos atletas.</DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[60vh] mt-4 rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="sticky top-0 bg-slate-900 text-slate-400 font-black uppercase tracking-widest">
                <tr>
                  <th className="p-4">Nome</th>
                  <th className="p-4">Nº</th>
                  <th className="p-4">Time</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {csvPreview.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/50">
                    <td className="p-4 font-bold uppercase">{item.nome}</td>
                    <td className="p-4">{item.numero}</td>
                    <td className="p-4">{item.time}</td>
                    <td className="p-4">
                      {item.errors.length > 0 ? (
                        <div className="flex items-center gap-1 text-red-500 font-bold uppercase text-[10px]">
                          <AlertCircle className="w-3 h-3" /> {item.errors[0]}
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-emerald-500 font-bold uppercase text-[10px]">
                          <CheckCircle2 className="w-3 h-3" /> OK
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ScrollArea>

          <DialogFooter className="mt-6">
            <Button variant="ghost" onClick={() => setShowCsvModal(false)} className="text-slate-400 font-bold">CANCELAR</Button>
            <Button
              onClick={processCsvImport}
              disabled={importingCsv || !csvPreview.some(i => i.errors.length === 0)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-widest px-8 rounded-xl h-12"
            >
              {importingCsv ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
              CONFIRMAR IMPORTAÇÃO
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
