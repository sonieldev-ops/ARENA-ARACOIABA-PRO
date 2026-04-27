'use client';

import { useState, useEffect } from 'react';
import { AdminPageHeader } from '@/src/modules/admin/components/AdminPageHeader';
import { Button } from '@/components/ui/button';
import { Plus, Search, ShieldCheck, Filter, Users, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { RefereeCard } from './components/RefereeCard';
import { RefereeForm } from './components/RefereeForm';
import { RefereeAssignment } from './components/RefereeAssignment';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useReferees } from './hooks/useReferees';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/src/lib/firebase/client';

export function RefereesPage() {
  const { referees, loading, addReferee, assignRefereesToMatch } = useReferees();
  const [matches, setMatches] = useState<any[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);

  useEffect(() => {
    async function fetchMatches() {
      try {
        const q = query(collection(db, 'partidas'), orderBy('scheduledDate', 'desc'));
        const snap = await getDocs(q);
        setMatches(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (e) {
        console.error('Error fetching matches:', e);
      } finally {
        setLoadingMatches(false);
      }
    }
    fetchMatches();
  }, []);

  const filteredReferees = referees.filter(ref =>
    ref.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ref.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddReferee = async (data: any) => {
    await addReferee(data);
  };

  const handleAssign = async (matchId: string, assignment: any) => {
    setIsAssigning(true);
    try {
      await assignRefereesToMatch(matchId, assignment);
    } finally {
      setIsAssigning(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest">Sincronizando arbitragem...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-20">
      <AdminPageHeader
        title="Corpo de Arbitragem"
        subtitle="Gestão de juízes, bandeirinhas e mesários da Arena Araçoiaba Pro."
        action={
          <Button
            onClick={() => setIsFormOpen(true)}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-900/20 px-6 h-12 transition-all active:scale-95"
          >
            <Plus className="mr-2 h-5 w-5" /> Novo Árbitro
          </Button>
        }
      />

      <Tabs defaultValue="list" className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <TabsList className="bg-zinc-900 border border-zinc-800 p-1 h-14 rounded-2xl">
            <TabsTrigger
              value="list"
              className="px-8 font-black uppercase text-[10px] tracking-widest rounded-xl data-[state=active]:bg-blue-600 data-[state=active]:text-white h-full transition-all"
            >
              <Users className="w-4 h-4 mr-2" /> Listagem
            </TabsTrigger>
            <TabsTrigger
              value="assign"
              className="px-8 font-black uppercase text-[10px] tracking-widest rounded-xl data-[state=active]:bg-blue-600 data-[state=active]:text-white h-full transition-all"
            >
              <ShieldCheck className="w-4 h-4 mr-2" /> Escalação
            </TabsTrigger>
          </TabsList>

          <div className="relative w-full md:w-80 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600 group-focus-within:text-blue-500 transition-colors" />
            <Input
              placeholder="Buscar por nome ou cidade..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-zinc-900/50 border-zinc-800/80 pl-11 h-14 rounded-2xl focus-visible:ring-blue-600/50 text-zinc-200 w-full transition-all focus:bg-zinc-900 shadow-inner"
            />
          </div>
        </div>

        <TabsContent value="list" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredReferees.map((ref) => (
              <RefereeCard key={ref.id} referee={ref} />
            ))}

            {filteredReferees.length === 0 && (
              <div className="col-span-full py-20 text-center bg-zinc-900/20 border border-dashed border-zinc-800 rounded-[2rem]">
                <div className="p-4 bg-zinc-900/50 rounded-2xl w-fit mx-auto mb-4 border border-zinc-800">
                  <Search className="w-8 h-8 text-zinc-700" />
                </div>
                <h3 className="text-zinc-500 font-black uppercase text-xs tracking-widest">Nenhum árbitro encontrado</h3>
                <p className="text-zinc-600 text-xs mt-1">Tente ajustar sua busca ou cadastrar um novo profissional.</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="assign" className="mt-0 max-w-3xl mx-auto">
          <RefereeAssignment
            referees={referees}
            matches={matches}
            onAssign={handleAssign}
            isLoading={isAssigning}
          />
        </TabsContent>
      </Tabs>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-3xl rounded-[2rem] overflow-hidden p-0">
          <DialogHeader className="p-8 border-b border-zinc-800 bg-zinc-950/50">
            <DialogTitle className="text-2xl font-black italic uppercase tracking-tighter">
              Cadastrar <span className="text-blue-500">Novo Árbitro</span>
            </DialogTitle>
          </DialogHeader>
          <div className="p-8">
            <RefereeForm
              onClose={() => setIsFormOpen(false)}
              onSubmit={handleAddReferee}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
