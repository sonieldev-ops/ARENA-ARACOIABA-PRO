'use client';

import { useState, useEffect, useCallback } from 'react';
import { Settings, Shield, Zap, Globe, Save, Database, Smartphone, Loader2, Trash2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/src/modules/auth/context/AuthContext';
import { addDoc, serverTimestamp, query, orderBy, limit } from 'firebase/firestore';
import { AdminPageHeader } from '@/src/modules/admin/components/AdminPageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { db } from '@/src/lib/firebase/client';
import { doc, getDoc, setDoc, collection, getDocs, writeBatch } from 'firebase/firestore';
import { formatFirebaseDate } from '@/src/lib/utils';

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState('geral');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState({
    orgName: 'Arena Araçoiaba Pro',
    location: 'Araçoiaba - PE',
    status: 'Ativo',
    supportEmail: 'suporte@arenapro.com.br',
    maintenanceMode: false,
    autoBackup: true
  });

  const [backups, setBackups] = useState<any[]>([]);
  const [loadingBackups, setLoadingBackups] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);

  const loadBackups = useCallback(async () => {
    setLoadingBackups(true);
    try {
      const q = query(collection(db, 'system_backups'), orderBy('timestamp', 'desc'), limit(5));
      const snap = await getDocs(q);
      setBackups(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error('Erro ao carregar backups:', e);
    } finally {
      setLoadingBackups(false);
    }
  }, []);

  useEffect(() => {
    async function loadSettings() {
      try {
        const docRef = doc(db, 'system_settings', 'global');
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const data = snap.data();
          setConfig(prev => ({
            ...prev,
            ...data,
            orgName: 'Arena Araçoiaba Pro',
            location: 'Araçoiaba - PE',
            status: 'Ativo'
          }));
        }
        await loadBackups();
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, [loadBackups]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'system_settings', 'global'), {
        ...config,
        updatedAt: new Date()
      });
      toast.success('Configurações salvas com sucesso!');
    } catch (e) {
      toast.error('Erro ao salvar configurações');
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateBackup = async () => {
    setIsBackingUp(true);
    toast.loading('Preparando backup dos dados da liga...', { id: 'backup' });

    try {
      const collections = ['campeonatos', 'times', 'atletas', 'partidas'];
      const backupData: any = {
        version: '1.0',
        generatedAt: new Date().toISOString(),
        orgName: config.orgName,
        data: {}
      };

      for (const colName of collections) {
        const snap = await getDocs(collection(db, colName));
        backupData.data[colName] = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      }

      // Trigger Download
      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const dateStr = new Date().toISOString().split('T')[0];
      link.href = url;
      link.download = `backup_arena_pro_${dateStr}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Save Log to Firestore
      const sizeInMB = (blob.size / (1024 * 1024)).toFixed(2) + 'MB';
      await addDoc(collection(db, 'system_backups'), {
        timestamp: serverTimestamp(),
        size: sizeInMB,
        status: 'Sucesso',
        type: 'Manual',
        fileName: link.download
      });

      toast.success('Backup exportado e registrado com sucesso!', { id: 'backup' });
      loadBackups();
    } catch (e) {
      console.error(e);
      toast.error('Falha ao gerar backup.', { id: 'backup' });
    } finally {
      setIsBackingUp(false);
    }
  };

  const [resetStep, setResetStep] = useState(0);
  const [resetProgress, setResetProgress] = useState(0);
  const [isAborted, setIsAborted] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [showResetModal, setShowResetModal] = useState(false);

  const { user } = useAuth();
  const handleNextStep = () => setResetStep(prev => prev + 1);

  const handleReset = async () => {
    if (user?.role !== 'SUPER_ADMIN') {
      toast.error('Acesso negado. Apenas SUPER_ADMIN pode realizar esta ação.');
      return;
    }

    if (resetStep < 3) {
      handleNextStep();
      return;
    }

    if (confirmText !== 'DELETAR AGORA') {
      toast.error('Digite a frase de confirmação corretamente.');
      return;
    }

    setSaving(true);
    setIsAborted(false);
    setResetProgress(0);
    
    try {
      await addDoc(collection(db, 'system_audit_logs'), {
        userId: user.uid,
        email: user.email,
        action: 'DATABASE_RESET',
        timestamp: serverTimestamp(),
        details: 'O usuário iniciou a limpeza total do banco de dados.',
        environment: process.env.NODE_ENV
      });

      const collections = ['matches', 'athletes', 'teams', 'rankings', 'match_events', 'match_audit_logs'];
      const total = collections.length;
      
      for (let i = 0; i < total; i++) {
        if (isAborted) {
          toast.info('Operação abortada pelo usuário.');
          break;
        }
        
        const colName = collections[i];
        const snap = await getDocs(collection(db, colName));
        const batch = writeBatch(db);
        snap.docs.forEach(d => batch.delete(d.ref));
        await batch.commit();
        
        setResetProgress(((i + 1) / total) * 100);
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      if (!isAborted) {
        toast.success('Banco de dados limpo com sucesso!');
        setShowResetModal(false);
        setResetStep(0);
      }
    } catch (e) {
      toast.error('Erro ao resetar banco');
    } finally {
      setSaving(false);
      setResetProgress(0);
    }
  };

  const handleAbort = () => {
    setIsAborted(true);
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20 max-w-6xl mx-auto">
      <AdminPageHeader
        title="Configurações da Liga"
        subtitle="Gerencie a identidade e o comportamento operacional da Arena Araçoiaba Pro."
        action={
          <Button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg shadow-lg shadow-blue-900/20 px-8 h-11 transition-all">
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="mr-2 h-4 w-4" />}
            Salvar Alterações
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
        <aside className="md:col-span-1 space-y-2">
          {[
            { id: 'geral', label: 'Geral', icon: Globe },
            { id: 'seguranca', label: 'Segurança', icon: Shield },
            { id: 'backup', label: 'Backup', icon: Database },
            { id: 'mobile', label: 'Mobile App', icon: Smartphone },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl font-bold text-sm transition-all ${
                activeTab === tab.id
                  ? 'bg-zinc-800 text-white border border-zinc-700 shadow-2xl'
                  : 'text-zinc-500 hover:bg-zinc-900/50 hover:text-zinc-300'
              }`}
            >
              <tab.icon className={`h-4 w-4 ${activeTab === tab.id ? 'text-blue-500' : ''}`} /> {tab.label}
            </button>
          ))}
        </aside>

        <div className="md:col-span-3 space-y-8">
          {activeTab === 'geral' && (
            <>
              <Card className="bg-zinc-900/40 border-zinc-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="border-b border-zinc-800/50 p-8">
                  <CardTitle className="text-white font-black uppercase italic tracking-wider flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                      <Settings className="h-5 w-5 text-blue-500" />
                    </div>
                    Identidade da Liga
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em]">Arena</label>
                      <div className="bg-zinc-950 border border-zinc-800 text-white rounded-2xl h-14 flex items-center px-4 font-bold text-lg shadow-inner">
                        {config.orgName}
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em]">Localização</label>
                      <div className="bg-zinc-950 border border-zinc-800 text-white rounded-2xl h-14 flex items-center px-4 font-bold text-lg shadow-inner">
                        {config.location}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em]">Status da Liga</label>
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]" />
                        <span className="font-bold text-white tracking-wide">{config.status}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 pt-4">
                    <div className="flex items-center justify-between p-6 bg-zinc-950/40 rounded-[2rem] border border-zinc-800 hover:border-zinc-700 transition-colors group">
                      <div className="flex gap-5">
                        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 group-hover:scale-110 transition-transform">
                          <Zap className="h-6 w-6 text-amber-500" />
                        </div>
                        <div>
                          <h4 className="text-white font-bold text-base">Modo Manutenção</h4>
                          <p className="text-zinc-500 text-sm mt-1">Bloqueia acesso de atletas e torcedores durante ajustes</p>
                        </div>
                      </div>
                      <Switch 
                        checked={config.maintenanceMode} 
                        onCheckedChange={v => setConfig({ ...config, maintenanceMode: v })}
                      />
                    </div>

                    <div className="flex items-center justify-between p-6 bg-zinc-950/40 rounded-[2rem] border border-zinc-800 hover:border-zinc-700 transition-colors group">
                      <div className="flex gap-5">
                        <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 group-hover:scale-110 transition-transform">
                          <Database className="h-6 w-6 text-blue-500" />
                        </div>
                        <div>
                          <h4 className="text-white font-bold text-base">Backup Automático</h4>
                          <p className="text-zinc-500 text-sm mt-1">Backup automático dos dados da liga (jogos, times e atletas)</p>
                        </div>
                      </div>
                      <Switch 
                        checked={config.autoBackup} 
                        onCheckedChange={v => setConfig({ ...config, autoBackup: v })}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-rose-500/5 border border-rose-500/20 rounded-[2rem] overflow-hidden">
                <CardContent className="p-8">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2">
                      <h4 className="text-rose-500 font-black uppercase text-xs tracking-[0.3em] flex items-center gap-3">
                        <AlertTriangle className="w-5 h-5" /> Zona de Perigo
                      </h4>
                      <div className="space-y-1">
                        <p className="text-white font-bold text-lg">Resetar dados da liga</p>
                        <p className="text-rose-500/60 text-sm font-semibold uppercase tracking-widest italic">Ação irreversível</p>
                      </div>
                    </div>
                    <Button
                      onClick={() => setShowResetModal(true)}
                      disabled={saving}
                      variant="destructive"
                      className="bg-rose-600 hover:bg-rose-700 text-white font-black uppercase tracking-widest text-xs px-10 h-14 rounded-2xl transition-all shadow-xl shadow-rose-900/20"
                    >
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
                      EXECUTAR RESET
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {activeTab === 'seguranca' && (
            <Card className="bg-zinc-900/40 border-zinc-800 rounded-3xl overflow-hidden">
              <CardHeader className="border-b border-zinc-800/50 p-8">
                <CardTitle className="text-white font-bold flex items-center gap-3">
                  <Shield className="h-5 w-5 text-blue-500" />
                  Segurança e Acessos
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="flex items-center justify-between p-6 bg-zinc-950/40 rounded-2xl border border-zinc-800">
                  <div>
                    <h4 className="text-white font-bold text-sm">Autenticação em Duas Etapas</h4>
                    <p className="text-zinc-500 text-xs mt-1">Obrigatório para administradores.</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between p-6 bg-zinc-950/40 rounded-2xl border border-zinc-800">
                  <div>
                    <h4 className="text-white font-bold text-sm">Registro de Novos Usuários</h4>
                    <p className="text-zinc-500 text-xs mt-1">Permitir que torcedores criem contas.</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'backup' && (
            <Card className="bg-zinc-900/40 border-zinc-800 rounded-3xl overflow-hidden">
              <CardHeader className="border-b border-zinc-800/50 p-8 flex flex-row items-center justify-between">
                <CardTitle className="text-white font-bold flex items-center gap-3">
                  <Database className="h-5 w-5 text-blue-500" />
                  Histórico de Backups
                </CardTitle>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={loadBackups}
                  disabled={loadingBackups}
                  className="text-zinc-500 hover:text-white"
                >
                  <Zap className={`w-4 h-4 mr-2 ${loadingBackups ? 'animate-spin' : ''}`} /> Atualizar
                </Button>
              </CardHeader>
              <CardContent className="p-8 space-y-4">
                {backups.length > 0 ? backups.map((b, i) => (
                  <div key={i} className="flex items-center justify-between p-6 bg-zinc-950/40 rounded-2xl border border-zinc-800">
                    <div>
                      <p className="text-white font-bold text-sm">{formatFirebaseDate(b.timestamp)}</p>
                      <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mt-1">
                        Tamanho: <span className="text-zinc-300">{b.size}</span> • Tipo: <span className="text-blue-500">{b.type}</span>
                      </p>
                    </div>
                    <div className="px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase border border-emerald-500/20 tracking-widest flex items-center gap-2">
                      <CheckCircle2 className="w-3 h-3" /> {b.status}
                    </div>
                  </div>
                )) : (
                  <div className="py-12 text-center bg-zinc-950/50 rounded-2xl border border-dashed border-zinc-800">
                    <Database className="w-8 h-8 text-zinc-800 mx-auto mb-3" />
                    <p className="text-zinc-600 font-bold uppercase text-[10px] tracking-widest">Nenhum backup registrado.</p>
                  </div>
                )}

                <Button
                  onClick={handleGenerateBackup}
                  disabled={isBackingUp}
                  className="w-full h-14 bg-zinc-100 hover:bg-white text-zinc-950 font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl gap-3 mt-6 transition-all active:scale-95 shadow-xl shadow-zinc-950/50"
                >
                  {isBackingUp ? <Loader2 className="w-5 h-5 animate-spin" /> : <Database className="w-5 h-5" />}
                  Gerar Backup Agora
                </Button>
              </CardContent>
            </Card>
          )}

          {activeTab === 'mobile' && (
            <Card className="bg-zinc-900/40 border-zinc-800 rounded-3xl overflow-hidden">
              <CardHeader className="border-b border-zinc-800/50 p-8">
                <CardTitle className="text-white font-bold flex items-center gap-3">
                  <Smartphone className="h-5 w-5 text-blue-500" />
                  Configurações Mobile
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Versão Atual (Android)</label>
                    <Input defaultValue="1.2.0" className="bg-zinc-950 border-zinc-800 text-white rounded-2xl h-14 font-bold" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Versão Atual (iOS)</label>
                    <Input defaultValue="1.1.5" className="bg-zinc-950 border-zinc-800 text-white rounded-2xl h-14 font-bold" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {showResetModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl transition-all">
          <div className="bg-zinc-950 border border-rose-500/30 w-full max-w-lg rounded-[3rem] p-12 shadow-[0_0_100px_rgba(225,29,72,0.1)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-rose-600 shadow-[0_0_20px_#e11d48]" />
            
            {!saving ? (
              <div className="space-y-10 text-center">
                <div className="flex justify-center">
                  <div className="w-24 h-24 bg-rose-500/10 rounded-[2rem] flex items-center justify-center border border-rose-500/20 shadow-inner">
                     <AlertTriangle className="w-12 h-12 text-rose-600" />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter">
                    {resetStep === 0 && "Confirmar Limpeza?"}
                    {resetStep === 1 && "VOCÊ TEM CERTEZA?"}
                    {resetStep === 2 && "PROTOCOLO FINAL"}
                  </h3>
                  <p className="text-zinc-400 text-base leading-relaxed">
                    {resetStep === 0 && "Esta ação apagará todos os jogos e atletas do sistema. Deseja prosseguir?"}
                    {resetStep === 1 && "Não há volta após este ponto. Todos os dados históricos serão destruídos."}
                    {resetStep === 2 && "Para confirmar a destruição total, digite exatamente a frase abaixo:"}
                  </p>
                </div>

                {resetStep === 2 && (
                  <div className="space-y-4">
                    <div className="text-[10px] font-black text-rose-600 tracking-[0.3em] uppercase">DELETAR AGORA</div>
                    <Input
                      value={confirmText}
                      onChange={e => setConfirmText(e.target.value.toUpperCase())}
                      placeholder="..."
                      className="bg-zinc-900 border-rose-600/30 text-center text-white h-16 rounded-2xl font-black uppercase tracking-[0.2em] focus:border-rose-600 transition-all text-lg"
                    />
                  </div>
                )}

                <div className="grid gap-4">
                  <Button
                    onClick={handleReset}
                    className={`h-16 font-black uppercase tracking-[0.2em] text-xs rounded-2xl transition-all ${
                      resetStep === 2 && confirmText !== 'DELETAR AGORA'
                      ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                      : 'bg-rose-600 hover:bg-rose-700 text-white shadow-2xl shadow-rose-900/40'
                    }`}
                  >
                    {resetStep === 2 ? 'DELETAR TUDO PERMANENTEMENTE' : 'PROSSEGUIR'}
                  </Button>
                  <Button
                    onClick={() => { setShowResetModal(false); setResetStep(0); }}
                    variant="ghost"
                    className="h-12 text-zinc-600 hover:text-white font-black uppercase tracking-[0.2em] text-[10px]"
                  >
                    CANCELAR OPERAÇÃO
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-10 text-center py-6">
                <div className="space-y-6">
                  <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white animate-pulse">Destruindo Dados... {Math.round(resetProgress)}%</h3>
                  <div className="w-full h-4 bg-zinc-900 rounded-full overflow-hidden p-1 border border-white/5">
                    <div
                      className="h-full bg-rose-600 rounded-full shadow-[0_0_20px_#e11d48] transition-all duration-300"
                      style={{ width: `${resetProgress}%` }}
                    />
                  </div>
                </div>
                <Button
                  onClick={handleAbort}
                  className="w-full h-16 bg-white text-black hover:bg-zinc-200 font-black uppercase tracking-[0.2em] text-xs rounded-2xl shadow-2xl"
                >
                  ABORTAR IMEDIATAMENTE
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
