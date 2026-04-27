'use client';

import { useState, useEffect } from 'react';
import { db, storage } from '@/src/lib/firebase/client';
import { collection, getDocs, addDoc, serverTimestamp, query, orderBy, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, Loader2, Image as ImageIcon, Trash2, Pencil, ExternalLink, Globe, Smartphone, ShieldCheck, X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { AdminPageHeader } from '@/src/modules/admin/components/AdminPageHeader';
import Link from 'next/link';

export default function SponsorsAdminPage() {
  const [sponsors, setSponsors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [link, setLink] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [position, setPosition] = useState('home'); // home, match, footer
  const [active, setActive] = useState(true);
  const [uploading, setUploading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'sponsors'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      setSponsors(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fileRef = ref(storage, `sponsors/${Date.now()}-${file.name}`);
      await uploadBytes(fileRef, file);
      const url = await getDownloadURL(fileRef);
      setLogoUrl(url);
    } catch (e) {
      toast.error('Erro no upload');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !logoUrl) {
      toast.error('Preencha o nome e envie a logo.');
      return;
    }

    const data = {
      name,
      link,
      logoUrl,
      position,
      active,
      updatedAt: serverTimestamp()
    };

    try {
      if (editingId) {
        await updateDoc(doc(db, 'sponsors', editingId), data);
        toast.success('Patrocinador atualizado!');
      } else {
        await addDoc(collection(db, 'sponsors'), { ...data, createdAt: serverTimestamp() });
        toast.success('Patrocinador cadastrado!');
      }
      resetForm();
      fetchData();
    } catch (e) {
      toast.error('Erro ao salvar');
    }
  };

  const resetForm = () => {
    setName('');
    setLink('');
    setLogoUrl('');
    setPosition('home');
    setActive(true);
    setEditingId(null);
    setIsCreating(false);
  };

  const startEdit = (s: any) => {
    setName(s.name);
    setLink(s.link || '');
    setLogoUrl(s.logoUrl);
    setPosition(s.position);
    setActive(s.active);
    setEditingId(s.id);
    setIsCreating(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir patrocinador?')) return;
    await deleteDoc(doc(db, 'sponsors', id));
    fetchData();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <AdminPageHeader
        title="Patrocinadores"
        subtitle="Monetize seu campeonato exibindo marcas parceiras."
        action={
          <Button onClick={() => setIsCreating(!isCreating)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg">
            {isCreating ? <X className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
            {isCreating ? 'Cancelar' : 'Novo Patrocinador'}
          </Button>
        }
      />

      {isCreating && (
        <Card className="bg-slate-900 border-blue-500/30 rounded-3xl overflow-hidden shadow-2xl">
          <CardHeader className="border-b border-slate-800 p-6">
            <CardTitle className="text-sm font-black uppercase tracking-widest text-blue-500">Configurar Parceiro</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Nome da Marca</label>
                  <Input value={name} onChange={e => setName(e.target.value)} className="bg-slate-950 border-slate-800 text-white rounded-xl h-12" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Link de Destino (URL)</label>
                  <Input value={link} onChange={e => setLink(e.target.value)} placeholder="https://..." className="bg-slate-950 border-slate-800 text-white rounded-xl h-12" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Posicionamento</label>
                  <Select value={position} onValueChange={setPosition}>
                    <SelectTrigger className="bg-slate-950 border-slate-800 text-white rounded-xl h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-950 border-slate-800 text-white">
                      <SelectItem value="home">Página Inicial</SelectItem>
                      <SelectItem value="match">Tela de Partida</SelectItem>
                      <SelectItem value="footer">Rodapé Geral</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-950 rounded-2xl border border-slate-800">
                  <span className="text-white font-bold text-sm">Status Ativo</span>
                  <Switch checked={active} onCheckedChange={setActive} />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Logo / Banner</label>
                  <div className="flex gap-4">
                    <Input type="file" onChange={handleFileUpload} className="bg-slate-950 border-slate-800 text-white rounded-xl h-12 flex-1" />
                    {logoUrl && <img src={logoUrl} className="h-12 w-20 object-contain bg-white rounded-lg p-1" />}
                  </div>
                </div>
              </div>
              <Button type="submit" className="w-full bg-blue-600 h-14 font-black uppercase tracking-widest rounded-2xl">
                {editingId ? 'SALVAR ALTERAÇÕES' : 'CADASTRAR PATROCINADOR'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {sponsors.map(s => (
            <Card key={s.id} className="bg-slate-900 border-slate-800 rounded-3xl overflow-hidden hover:border-blue-500 transition-all">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center gap-4">
                  <div className="w-full h-32 bg-white rounded-2xl p-4 flex items-center justify-center">
                    <img src={s.logoUrl} className="max-h-full max-w-full object-contain" alt={s.name} />
                  </div>
                  <div>
                    <h3 className="font-black text-white uppercase italic">{s.name}</h3>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{s.position}</p>
                  </div>
                  <div className="flex gap-2 w-full">
                    <Button variant="outline" size="sm" onClick={() => startEdit(s)} className="flex-1 border-slate-800 hover:bg-slate-800 rounded-xl"><Pencil className="h-3 w-3 mr-2" /> Editar</Button>
                    <Button variant="outline" size="sm" onClick={() => handleDelete(s.id)} className="flex-1 border-slate-800 text-red-500 hover:bg-red-500/10 rounded-xl"><Trash2 className="h-3 w-3 mr-2" /> Excluir</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
