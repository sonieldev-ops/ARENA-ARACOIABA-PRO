'use client';

import { useEffect, useState } from 'react';
import { db } from '@/src/lib/firebase/client';
import { collection, query, orderBy, onSnapshot, limit, where, Timestamp } from 'firebase/firestore';
import {
  Loader2,
  ClipboardList,
  User,
  Clock,
  ShieldCheck,
  ArrowLeft,
  Search,
  Filter,
  AlertTriangle,
  Database,
  ShieldAlert,
  Calendar as CalendarIcon,
  Trash2,
  Lock,
  Play,
  FileText
} from 'lucide-react';
import { sanitizeData, formatFirebaseDate, translateRole, cn } from '@/src/lib/utils';
import { AdminPageHeader } from '@/src/modules/admin/components/AdminPageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Link from 'next/link';
import { useAuth } from '@/src/modules/auth/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function AdminAuditPage() {
  const { user: currentUser, loading: authLoading } = useAuth();
  const router = useRouter();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('ALL');
  const [filterSeverity, setFilterSeverity] = useState('ALL');

  // Proteção de Rota: Apenas Super Admin
  useEffect(() => {
    if (!authLoading && currentUser && currentUser.role !== 'SUPER_ADMIN') {
      router.push('/admin');
    }
  }, [currentUser, authLoading, router]);

  useEffect(() => {
    // Escuta tanto logs de partida quanto logs do sistema
    const qMatch = query(collection(db, 'match_audit_logs'), orderBy('timestamp', 'desc'), limit(50));
    const qSystem = query(collection(db, 'system_audit_logs'), orderBy('timestamp', 'desc'), limit(50));

    let matchLogs: any[] = [];
    let systemLogs: any[] = [];

    const unsubMatch = onSnapshot(qMatch, (snap) => {
      matchLogs = snap.docs.map(doc => sanitizeData({ id: doc.id, category: 'MATCH', ...doc.data() }));
      mergeAndSet();
    });

    const unsubSystem = onSnapshot(qSystem, (snap) => {
      systemLogs = snap.docs.map(doc => sanitizeData({ id: doc.id, category: 'SYSTEM', ...doc.data() }));
      mergeAndSet();
    });

    function mergeAndSet() {
      const merged = [...matchLogs, ...systemLogs].sort((a, b) => {
        const timeA = a.timestamp?.seconds || 0;
        const timeB = b.timestamp?.seconds || 0;
        return timeB - timeA;
      });
      setLogs(merged);
      setLoading(false);
    }

    return () => { unsubMatch(); unsubSystem(); };
  }, []);

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'DATABASE_RESET': return <Trash2 className="text-red-600" />;
      case 'ROLE_CHANGE': return <Lock className="text-amber-600" />;
      case 'FINISH_MATCH': return <ShieldCheck className="text-emerald-600" />;
      case 'START_MATCH': return <Play className="text-blue-600" />;
      case 'CREATE_CHAMPIONSHIP': return <Database className="text-indigo-600" />;
      case 'UPDATE_FINANCE': return <FileText className="text-green-600" />;
      default: return <ClipboardList className="text-slate-400" />;
    }
  };

  const getSeverity = (action: string) => {
    const critical = ['DATABASE_RESET', 'ROLE_CHANGE', 'DELETE_TEAM', 'DELETE_CHAMPIONSHIP'];
    const medium = ['FINISH_MATCH', 'REGISTER_RED_CARD', 'UPDATE_FINANCE'];
    if (critical.includes(action)) return { label: 'CRÍTICO', class: 'bg-red-600 text-white animate-pulse' };
    if (medium.includes(action)) return { label: 'ALTA', class: 'bg-amber-500 text-black' };
    return { label: 'NORMAL', class: 'bg-slate-100 text-slate-600' };
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch =
      log.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.matchId?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesAction = filterAction === 'ALL' || log.action === filterAction;
    const severity = getSeverity(log.action);
    const matchesSeverity = filterSeverity === 'ALL' || severity.label === filterSeverity;

    return matchesSearch && matchesAction && matchesSeverity;
  });

  if (authLoading || loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-red-600" />
        <p className="text-slate-500 font-medium uppercase text-[10px] tracking-widest">Sincronizando registros de auditoria...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <AdminPageHeader
        title="Logs de Auditoria Sênior"
        subtitle="Rastreabilidade total para ações administrativas e de governança."
        action={
          <div className="flex gap-2">
             <Button variant="outline" className="border-slate-800 text-slate-400" asChild>
                <Link href="/admin/configuracoes"><ArrowLeft className="mr-2 h-4 w-4" /> Configurações</Link>
             </Button>
             <Badge className="bg-red-600/10 text-red-500 border-red-500/20 px-4 py-2 font-black uppercase tracking-widest">
                Acesso Super Admin
             </Badge>
          </div>
        }
      />

      {/* Filtros Avançados */}
      <Card className="bg-slate-900 border-slate-800 p-6 rounded-3xl">
         <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2 relative">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
               <Input
                  placeholder="Pesquisar por usuário, email ou ID..."
                  className="pl-10 bg-slate-950 border-slate-800 text-white rounded-xl h-12"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
               />
            </div>
            <Select value={filterAction} onValueChange={setFilterAction}>
               <SelectTrigger className="bg-slate-950 border-slate-800 h-12 rounded-xl text-white">
                  <SelectValue placeholder="Tipo de Ação" />
               </SelectTrigger>
               <SelectContent className="bg-slate-950 border-slate-800 text-white">
                  <SelectItem value="ALL">Todas as Ações</SelectItem>
                  <SelectItem value="DATABASE_RESET">Reset de Banco</SelectItem>
                  <SelectItem value="ROLE_CHANGE">Mudança de Role</SelectItem>
                  <SelectItem value="FINISH_MATCH">Fim de Jogo</SelectItem>
                  <SelectItem value="START_MATCH">Início de Jogo</SelectItem>
               </SelectContent>
            </Select>
            <Select value={filterSeverity} onValueChange={setFilterSeverity}>
               <SelectTrigger className="bg-slate-950 border-slate-800 h-12 rounded-xl text-white">
                  <SelectValue placeholder="Gravidade" />
               </SelectTrigger>
               <SelectContent className="bg-slate-950 border-slate-800 text-white">
                  <SelectItem value="ALL">Qualquer Gravidade</SelectItem>
                  <SelectItem value="CRÍTICO">Crítico</SelectItem>
                  <SelectItem value="ALTA">Alta</SelectItem>
                  <SelectItem value="NORMAL">Normal</SelectItem>
               </SelectContent>
            </Select>
         </div>
      </Card>

      {/* Lista de Logs */}
      <div className="space-y-4">
        {filteredLogs.map((log) => {
          const sev = getSeverity(log.action);
          return (
            <Card key={log.id} className="bg-slate-900 border-slate-800 rounded-3xl overflow-hidden hover:border-slate-700 transition-all group">
              <CardContent className="p-6">
                 <div className="flex flex-col lg:flex-row justify-between gap-6">
                    <div className="flex items-start gap-5">
                       <div className="w-14 h-14 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-xl shadow-inner group-hover:scale-110 transition-transform">
                          {getActionIcon(log.action)}
                       </div>
                       <div className="space-y-1">
                          <div className="flex items-center gap-3">
                             <h3 className="font-black text-white text-lg uppercase tracking-tight italic">
                                {log.action?.replace(/_/g, ' ')}
                             </h3>
                             <Badge className={cn("text-[8px] font-black px-2 py-0.5 rounded-full border-none", sev.class)}>
                                {sev.label}
                             </Badge>
                          </div>

                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                             <div className="flex items-center gap-1.5 text-slate-400 font-bold">
                                <User className="w-3 h-3 text-red-600" />
                                {log.userName} <span className="text-slate-600 font-normal">({log.email || 'N/A'})</span>
                             </div>
                             <div className="flex items-center gap-1.5 text-slate-400">
                                <Clock className="w-3 h-3 text-blue-600" />
                                {formatFirebaseDate(log.timestamp)}
                             </div>
                             <div className="flex items-center gap-1.5 text-slate-500 font-mono text-[10px]">
                                <Database className="w-3 h-3" />
                                {log.id.substring(0,12)}
                             </div>
                          </div>
                       </div>
                    </div>

                    <div className="flex flex-col justify-center items-end gap-2 text-right">
                       <div className="flex gap-2">
                          <Badge variant="outline" className="border-slate-800 text-slate-500 text-[9px] font-black uppercase">
                             Cat: {log.category}
                          </Badge>
                          <Badge variant="outline" className="border-slate-800 text-slate-500 text-[9px] font-black uppercase">
                             IP: {log.ip || 'Local'}
                          </Badge>
                       </div>
                       {log.details && (
                          <div className="text-[10px] text-slate-500 bg-slate-950 p-2 rounded-lg border border-white/5 max-w-xs font-mono truncate">
                             {typeof log.details === 'object' ? JSON.stringify(log.details) : log.details}
                          </div>
                       )}
                    </div>
                 </div>
              </CardContent>
            </Card>
          );
        })}

        {filteredLogs.length === 0 && (
          <div className="py-32 text-center bg-slate-900/50 rounded-[3rem] border-2 border-dashed border-slate-800">
             <AlertTriangle className="w-16 h-16 text-slate-800 mx-auto mb-6" />
             <h3 className="text-slate-400 font-black text-xl uppercase tracking-tighter italic">Nenhum registro encontrado</h3>
             <p className="text-slate-600 text-sm mt-2 font-medium">Tente ajustar os filtros ou pesquisar por outro termo.</p>
          </div>
        )}
      </div>
    </div>
  );
}

