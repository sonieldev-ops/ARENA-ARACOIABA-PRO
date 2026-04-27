'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, serverTimestamp, query, orderBy, where, deleteDoc, doc, updateDoc, writeBatch } from 'firebase/firestore';
import { db } from '@/src/lib/firebase/client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Swords, Plus, Loader2, Calendar, MapPin, Clock, ArrowLeft, Pencil, Trash2, X, Check, FileText, Download } from "lucide-react";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { toast } from 'sonner';
import { UsersAdminService } from '@/src/modules/users/services/users-admin.service';
import { UserRole } from '@/src/types/auth';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { sanitizeData, translateEventType } from "@/src/lib/utils";
import { AdminPageHeader } from '@/src/modules/admin/components/AdminPageHeader';
import Link from 'next/link';

export default function MatchesAdminPage() {
  const [matches, setMatches] = useState<any[]>([]);
  const [championships, setChampionships] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [editingMatchId, setEditingMatchId] = useState<string | null>(null);

  // Form State
  const [selectedChampId, setSelectedChampId] = useState('');
  const [teamAId, setTeamAId] = useState('');
  const [teamBId, setTeamBId] = useState('');
  const [matchDate, setMatchDate] = useState('');
  const [matchTime, setMatchTime] = useState('20:00');
  const [matchLocation, setMatchLocation] = useState('');
  const [liveStreamUrl, setLiveStreamUrl] = useState('');
  const [liveStreamPlatform, setLiveStreamPlatform] = useState('youtube');

  const [referees, setReferees] = useState<any[]>([]);
  const [selectedRefereeId, setSelectedRefereeId] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const champSnap = await getDocs(collection(db, 'campeonatos'));
      setChampionships(champSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      const teamSnap = await getDocs(collection(db, 'times'));
      setTeams(teamSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      // Buscar Árbitros (Necessário para atribuição)
      const refereeList = await UsersAdminService.listUsers({ role: UserRole.REFEREE });
      setReferees(refereeList);

      const qMatches = query(collection(db, 'partidas'), orderBy('scheduledDate', 'desc'));
      const matchSnap = await getDocs(qMatches);
      setMatches(matchSnap.docs.map(doc => sanitizeData({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateSumulaPDF = async (match: any) => {
    try {
      toast.loading('Gerando súmula profissional...', { id: 'pdf' });

      // Buscar eventos da partida na subcoleção recomendada
      const qEvents = query(
        collection(db, 'partidas', match.id, 'events'),
        orderBy('timestamp', 'asc')
      );
      const eventsSnap = await getDocs(qEvents);
      const events = eventsSnap.docs.map(d => d.data());

      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();

      // Cabeçalho Premium
      doc.setFillColor(11, 12, 14); // Cor de fundo do app
      doc.rect(0, 0, pageWidth, 45, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text('ARENA ARACOIABA PRO', 15, 25);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('SÚMULA OFICIAL DE PARTIDA - REGISTROS EM TEMPO REAL', 15, 33);
      doc.text(`Documento gerado em: ${new Date().toLocaleString('pt-BR')}`, 15, 38);

      doc.setTextColor(100, 100, 100);
      doc.text(`CÓDIGO: ${match.id}`, pageWidth - 15, 33, { align: 'right' });

      // Informações da Partida
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(`${match.championshipName || 'Torneio Arena Pro'}`, 15, 60);

      autoTable(doc, {
        startY: 65,
        head: [['Data', 'Horário', 'Local', 'Árbitro Principal']],
        body: [[
          match.scheduledDate?.toDate().toLocaleDateString('pt-BR') || '-',
          match.scheduledDate?.toDate().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) || '-',
          match.location || 'Não informado',
          match.refereeName || 'A definir'
        ]],
        theme: 'grid',
        headStyles: { fillColor: [220, 38, 38], textColor: [255, 255, 255], fontStyle: 'bold' }
      });

      // Placar Final
      const scoreY = (doc as any).lastAutoTable.finalY + 20;
      doc.setFillColor(244, 244, 245);
      doc.rect(15, scoreY - 10, pageWidth - 30, 25, 'F');

      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      const placar = `${match.teamAName} ${match.scoreA} x ${match.scoreB} ${match.teamBName}`;
      doc.text(placar, pageWidth / 2, scoreY + 7, { align: 'center' });

      // Eventos de Jogo
      doc.setFontSize(12);
      doc.text('RELAÇÃO CRONOLÓGICA DE EVENTOS', 15, scoreY + 30);

      const tableData = events.map((e: any) => [
        e.minute ? `${e.minute}'` : (e.timestamp?.toDate().toLocaleTimeString('pt-BR', { minute: '2-digit', second: '2-digit' }) || '-'),
        translateEventType(e.type),
        e.athleteName || e.playerName || '-',
        e.teamName || (e.teamId === match.teamAId ? match.teamAName : (e.teamId === match.teamBId ? match.teamBName : '-')),
        e.description || '-',
        e.createdByName || 'Árbitro'
      ]);

      autoTable(doc, {
        startY: scoreY + 35,
        head: [['Tempo', 'Evento', 'Atleta', 'Time', 'Descrição', 'Responsável']],
        body: tableData.length > 0 ? tableData : [['-', 'Nenhum evento registrado na súmula oficial.', '-', '-', '-', '-']],
        styles: { fontSize: 8 },
        headStyles: { fillColor: [31, 41, 55] },
        columnStyles: {
           0: { cellWidth: 15 },
           1: { cellWidth: 30 },
           4: { cellWidth: 'auto' }
        }
      });

      // Resumo de Gols e Cartões no PDF
      const finalY = (doc as any).lastAutoTable.finalY + 15;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('RESUMO DISCIPLINAR E TÉCNICO:', 15, finalY);

      const goalsList = events.filter((e: any) => e.type === 'GOAL');
      const yellowCards = events.filter((e: any) => e.type === 'YELLOW_CARD');
      const redCards = events.filter((e: any) => e.type === 'RED_CARD');
      const observations = events.filter((e: any) => e.type === 'OBSERVATION');

      doc.setFont('helvetica', 'normal');
      doc.text(`Total de Gols: ${goalsList.length}`, 15, finalY + 7);
      doc.text(`Cartões Amarelos: ${yellowCards.length}`, 15, finalY + 12);
      doc.text(`Cartões Vermelhos: ${redCards.length}`, 15, finalY + 17);

      if (observations.length > 0) {
         doc.setFont('helvetica', 'bold');
         doc.text('OBSERVAÇÕES DO ÁRBITRO:', 15, finalY + 27);
         doc.setFont('helvetica', 'normal');
         observations.forEach((obs, i) => {
            doc.text(`- ${obs.description}`, 15, finalY + 32 + (i * 5));
         });
      }

      // Rodapé e Assinaturas
      const footerY = doc.internal.pageSize.getHeight() - 40;

      // Check de Fechamento
      if (match.summaryLocked) {
         doc.setFillColor(232, 252, 235);
         doc.rect(15, footerY - 10, pageWidth - 30, 10, 'F');
         doc.setTextColor(22, 101, 52);
         doc.setFontSize(8);
         doc.setFont('helvetica', 'bold');
         doc.text(`SÚMULA REVISADA E FINALIZADA POR ${match.closedByName || 'ÁRBITRO'} EM ${match.closedAt?.toDate().toLocaleString('pt-BR') || ''}`, pageWidth/2, footerY - 3.5, { align: 'center' });
      }

      doc.setTextColor(0,0,0);
      doc.setDrawColor(200, 200, 200);
      doc.line(20, footerY + 15, 80, footerY + 15);
      doc.line(pageWidth - 80, footerY + 15, pageWidth - 20, footerY + 15);

      doc.setFontSize(8);
      doc.text('ASSINATURA DO ÁRBITRO', 50, footerY + 20, { align: 'center' });
      doc.text('COORDENAÇÃO ARENA PRO', pageWidth - 50, footerY + 20, { align: 'center' });

      // Footer
      doc.setFontSize(7);
      doc.setTextColor(150, 150, 150);
      doc.text('Este documento é uma representação oficial gerada pelo Sistema Arena Aracoiaba Pro.', pageWidth/2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });

      doc.save(`sumula_${match.teamAName}_vs_${match.teamBName}.pdf`);
      toast.success('Súmula exportada com sucesso!', { id: 'pdf' });
    } catch (error) {
      console.error(error);
      toast.error('Falha ao gerar PDF.', { id: 'pdf' });
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const resetForm = () => {
    setSelectedChampId('');
    setTeamAId('');
    setTeamBId('');
    setMatchDate('');
    setMatchTime('20:00');
    setMatchLocation('');
    setSelectedRefereeId('');
    setEditingMatchId(null);
  };

  const handleEdit = (match: any) => {
    if (match.status === 'FINISHED') {
       toast.error('Partidas finalizadas não podem ser editadas diretamente.');
       return;
    }
    setSelectedChampId(match.championshipId);
    setTeamAId(match.teamAId);
    setTeamBId(match.teamBId);
    setSelectedRefereeId(match.refereeId || '');

    const date = match.scheduledDate?.toDate ? match.scheduledDate.toDate() : new Date(match.scheduledDate);
    setMatchDate(date.toISOString().split('T')[0]);
    setMatchTime(date.toTimeString().substring(0, 5));

    setMatchLocation(match.location);
    setEditingMatchId(match.id);
    setIsCreating(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta partida?')) return;

    try {
      const { deleteDoc, doc } = await import('firebase/firestore');
      await deleteDoc(doc(db, 'partidas', id));
      fetchData();
    } catch (error) {
      alert('Erro ao excluir partida');
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChampId || !teamAId || !teamBId || !matchDate || !matchTime || teamAId === teamBId) {
      alert('Preencha todos os campos corretamente. Os times devem ser diferentes.');
      return;
    }

    try {
      const champ = championships.find(c => c.id === selectedChampId);
      const teamA = teams.find(t => t.id === teamAId);
      const teamB = teams.find(t => t.id === teamBId);
      const referee = referees.find(r => r.uid === selectedRefereeId);

      // Combinar data e hora
      const [year, month, day] = matchDate.split('-').map(Number);
      const [hours, minutes] = matchTime.split(':').map(Number);
      const scheduledDate = new Date(year, month - 1, day, hours, minutes);

      const matchData = {
        championshipId: selectedChampId,
        championshipName: champ?.name,
        teamAId,
        teamAName: teamA?.name,
        teamBId,
        teamBName: teamB?.name,
        refereeId: selectedRefereeId || null,
        refereeName: referee?.fullName || 'Não atribuído',
        location: matchLocation || 'Campo Principal',
        scheduledDate,
        liveStreamUrl: liveStreamUrl || null,
        liveStreamPlatform: liveStreamUrl ? liveStreamPlatform : null,
        isLive: false,
        updatedAt: serverTimestamp(),
      };

      if (editingMatchId) {
        const { updateDoc, doc } = await import('firebase/firestore');
        await updateDoc(doc(db, 'partidas', editingMatchId), matchData);
      } else {
        await addDoc(collection(db, 'partidas'), {
          ...matchData,
          scoreA: 0,
          scoreB: 0,
          status: 'SCHEDULED', // SCHEDULED, LIVE, FINISHED
          createdAt: serverTimestamp(),
        });
      }

      setIsCreating(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error(error);
      alert('Erro ao processar partida.');
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'SCHEDULED': return 'AGENDADA';
      case 'LIVE': return 'AO VIVO';
      case 'FINISHED': return 'FINALIZADA';
      default: return status;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <AdminPageHeader
        title="Gestão de Partidas"
        subtitle="Agendamento de confrontos e controle da tabela oficial."
        action={
          <div className="flex gap-2">
            <Button variant="outline" className="border-slate-800 text-slate-400" asChild>
                <Link href="/admin"><ArrowLeft className="mr-2 h-4 w-4" /> Voltar</Link>
            </Button>
            <Button
              onClick={() => {
                if (isCreating) resetForm();
                setIsCreating(!isCreating);
              }}
              className="bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg shadow-red-900/20"
            >
              {isCreating ? <X className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
              {isCreating ? 'Cancelar' : 'Nova Partida'}
            </Button>
          </div>
        }
      />

      {isCreating && (
        <Card className="bg-slate-900 border-red-600/30 rounded-3xl overflow-hidden shadow-2xl">
          <CardHeader className="border-b border-slate-800 p-6 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-black uppercase text-red-600 tracking-widest">
              {editingMatchId ? 'Editar Confronto' : 'Configurar Confronto'}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleCreate} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest px-1">Campeonato</label>
                   <Select onValueChange={setSelectedChampId} value={selectedChampId}>
                    <SelectTrigger className="bg-slate-950 border-slate-800 text-white rounded-xl h-12">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-950 border-slate-800 text-white">
                      {championships.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest px-1">Mandante</label>
                   <Select onValueChange={setTeamAId} value={teamAId}>
                    <SelectTrigger className="bg-slate-950 border-slate-800 text-white rounded-xl h-12">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-950 border-slate-800 text-white">
                      {teams.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest px-1">Visitante</label>
                   <Select onValueChange={setTeamBId} value={teamBId}>
                    <SelectTrigger className="bg-slate-950 border-slate-800 text-white rounded-xl h-12">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-950 border-slate-800 text-white">
                      {teams.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest px-1">Árbitro Oficial</label>
                   <Select onValueChange={setSelectedRefereeId} value={selectedRefereeId}>
                    <SelectTrigger className="bg-slate-950 border-slate-800 text-white rounded-xl h-12">
                      <SelectValue placeholder="Atribuir Árbitro..." />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-950 border-slate-800 text-white">
                      {referees.map(r => <SelectItem key={r.uid} value={r.uid}>{r.fullName}</SelectItem>)}
                      {referees.length === 0 && <div className="p-2 text-[10px] text-slate-500 text-center">Nenhum árbitro cadastrado</div>}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest px-1">Data do Jogo</label>
                   <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500 z-10" />
                      <Input
                        type="date"
                        value={matchDate}
                        onChange={(e) => setMatchDate(e.target.value)}
                        className="bg-slate-950 border-slate-800 text-white rounded-xl h-12 pl-10 [color-scheme:dark]"
                      />
                   </div>
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest px-1">Horário</label>
                   <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500 z-10" />
                      <Input
                        type="time"
                        value={matchTime}
                        onChange={(e) => setMatchTime(e.target.value)}
                        className="bg-slate-950 border-slate-800 text-white rounded-xl h-12 pl-10 [color-scheme:dark]"
                      />
                   </div>
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest px-1">Local da Partida</label>
                   <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500 z-10" />
                      <Input
                        placeholder="Ex: Arena Principal"
                        value={matchLocation}
                        onChange={(e) => setMatchLocation(e.target.value)}
                        className="bg-slate-950 border-slate-800 text-white rounded-xl h-12 pl-10"
                      />
                   </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest px-1">Link de Transmissão (URL)</label>
                   <Input
                    placeholder="https://youtube.com/..."
                    value={liveStreamUrl}
                    onChange={e => setLiveStreamUrl(e.target.value)}
                    className="bg-slate-950 border-slate-800 text-white rounded-xl h-12"
                   />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest px-1">Plataforma</label>
                   <Select value={liveStreamPlatform} onValueChange={setLiveStreamPlatform}>
                      <SelectTrigger className="bg-slate-950 border-slate-800 text-white rounded-xl h-12">
                         <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-950 border-slate-800 text-white">
                         <SelectItem value="youtube">YouTube</SelectItem>
                         <SelectItem value="twitch">Twitch</SelectItem>
                         <SelectItem value="facebook">Facebook</SelectItem>
                         <SelectItem value="other">Outra</SelectItem>
                      </SelectContent>
                   </Select>
                </div>
              </div>
              <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 h-14 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-red-900/20">
                {editingMatchId ? (
                  <><Check className="mr-2 h-5 w-5" /> SALVAR ALTERAÇÕES</>
                ) : (
                  'AGENDAR JOGO AGORA'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}


      {loading ? (
        <div className="flex flex-col items-center justify-center py-40 gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-red-600" />
          <p className="text-slate-500 font-medium">Carregando partidas...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {matches.map((match) => (
            <Card key={match.id} className="bg-slate-900 border-slate-800 rounded-3xl overflow-hidden hover:border-slate-700 transition-all group">
              <CardContent className="p-6 flex flex-col lg:flex-row items-center justify-between gap-8">
                <div className="flex-1 flex items-center justify-end gap-6 text-right">
                  <span className="text-xl lg:text-2xl font-black text-white group-hover:text-red-500 transition-colors uppercase italic">{match.teamAName}</span>
                  <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-500 font-black text-[10px]">
                    {match.teamAName?.substring(0, 2).toUpperCase()}
                  </div>
                </div>

                <div className="flex items-center gap-6 bg-slate-950 px-8 py-4 rounded-3xl border border-slate-800 shadow-inner">
                   <span className="text-4xl lg:text-5xl font-black text-white tabular-nums tracking-tighter">{match.scoreA}</span>
                   <div className="flex flex-col items-center">
                      <span className="text-[10px] font-black text-red-600 uppercase tracking-[0.2em] mb-1">vs</span>
                      <div className="w-1.5 h-1.5 bg-slate-800 rounded-full" />
                   </div>
                   <span className="text-4xl lg:text-5xl font-black text-white tabular-nums tracking-tighter">{match.scoreB}</span>
                </div>

                <div className="flex-1 flex items-center justify-start gap-6 text-left">
                  <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-500 font-black text-[10px]">
                    {match.teamBName?.substring(0, 2).toUpperCase()}
                  </div>
                  <span className="text-xl lg:text-2xl font-black text-white group-hover:text-red-500 transition-colors uppercase italic">{match.teamBName}</span>
                </div>

                <div className="flex flex-col items-center lg:items-end gap-2 min-w-[180px] pt-4 lg:pt-0 border-t lg:border-t-0 lg:border-l border-slate-800 lg:pl-8">
                  <Badge className={`
                    px-4 py-1 rounded-full font-black text-[10px] tracking-widest
                    ${match.status === 'LIVE' ? 'bg-red-600 text-white animate-pulse' : 
                      match.status === 'FINISHED' ? 'bg-slate-800 text-slate-400' : 
                      'bg-blue-600/10 text-blue-500 border border-blue-500/20'}
                  `}>
                    {getStatusLabel(match.status)}
                  </Badge>
                  <div className="flex flex-col items-center lg:items-end text-[10px] font-bold text-slate-500 uppercase tracking-widest gap-1 mt-1">
                    <span className="flex items-center gap-1.5"><Calendar className="h-3 w-3" /> {match.scheduledDate?.toDate().toLocaleDateString('pt-BR')}</span>
                    <span className="flex items-center gap-1.5"><Clock className="h-3 w-3" /> {match.scheduledDate?.toDate().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                    <span className="flex items-center gap-1.5 mt-1 text-slate-600"><MapPin className="h-3 w-3" /> {match.location}</span>
                  </div>
                  
                  <div className="flex gap-2 w-full mt-2">
                    {match.status !== 'FINISHED' && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 h-8 rounded-lg text-[9px] font-black border-slate-800 hover:bg-blue-600 hover:text-white transition-all uppercase"
                        asChild
                      >
                          <Link href="/admin/live-control">LIVE</Link>
                      </Button>
                    )}
                    {match.status === 'FINISHED' && (
                      <Button
                        onClick={() => generateSumulaPDF(match)}
                        variant="outline"
                        size="sm"
                        className="flex-1 h-8 rounded-lg text-[9px] font-black border-slate-800 text-emerald-500 hover:bg-emerald-500/10 uppercase"
                      >
                        <FileText className="h-3 w-3 mr-1.5" /> Súmula
                      </Button>
                    )}
                    <Button
                      onClick={() => handleEdit(match)}
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-lg border-slate-800 text-slate-400 hover:bg-slate-800"
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button
                      onClick={() => handleDelete(match.id)}
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-lg border-slate-800 text-red-500 hover:bg-red-500/10"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {matches.length === 0 && (
            <div className="text-center py-20 bg-slate-900/50 rounded-3xl border-2 border-dashed border-slate-800">
               <Swords className="h-12 w-12 text-slate-700 mx-auto mb-4" />
               <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Nenhuma partida agendada.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
