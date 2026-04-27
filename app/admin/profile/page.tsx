'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/src/modules/auth/context/AuthContext';
import { db, auth } from '@/src/lib/firebase/client';
import { doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { sendPasswordResetEmail, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { AdminPageHeader } from '@/src/modules/admin/components/AdminPageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  User,
  Mail,
  Shield,
  Calendar,
  Phone,
  Activity,
  Loader2,
  Lock,
  Key,
  RefreshCcw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Settings,
  Bell,
  Languages,
  Database,
  Eye,
  LogOut,
  MapPin,
  Building,
  History,
  Clock,
  Laptop
} from 'lucide-react';
import { toast } from 'sonner';
import { cn, formatFirebaseDate, translateRole, translateStatus } from '@/src/lib/utils';
import { UserRole, UserStatus } from '@/src/types/auth';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function AdminProfilePage() {
  const { user: authUser, loading: authLoading } = useAuth();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form states
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [organization, setOrganization] = useState('');

  useEffect(() => {
    if (!authUser?.uid) return;

    const unsub = onSnapshot(doc(db, 'usuarios', authUser.uid), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setUser({ id: doc.id, ...data });
        setFullName(data.fullName || '');
        setPhone(data.phone || '');
        setCity(data.city || '');
        setState(data.state || '');
        setOrganization(data.organizationName || '');
      }
      setLoading(false);
    });

    return () => unsub();
  }, [authUser]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    try {
      await updateDoc(doc(db, 'usuarios', user.id), {
        fullName,
        phone,
        city,
        state,
        organizationName: organization,
        updatedAt: new Date()
      });
      toast.success("Perfil atualizado com sucesso!");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao atualizar perfil.");
    } finally {
      setSaving(false);
    }
  };

  const handleResetPassword = async () => {
    if (!user?.email) return;
    try {
      await sendPasswordResetEmail(auth, user.email);
      toast.success("E-mail de redefinição de senha enviado!");
    } catch (error) {
      toast.error("Erro ao enviar e-mail de redefinição.");
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-red-600" />
        <p className="text-slate-500 font-medium tracking-widest uppercase text-[10px]">Carregando seu portal...</p>
      </div>
    );
  }

  if (!user) return <div className="p-20 text-center text-slate-500">Perfil não encontrado.</div>;

  const isSuperAdmin = user.role === UserRole.SUPER_ADMIN;
  const isAdmin = user.role === UserRole.SUPER_ADMIN || user.role === UserRole.ORGANIZER;

  const permissions = [
    { label: 'Criar campeonatos', allowed: isAdmin },
    { label: 'Editar campeonatos', allowed: isAdmin },
    { label: 'Gerenciar partidas', allowed: isAdmin || user.role === 'REFEREE' },
    { label: 'Gerenciar árbitros', allowed: isAdmin },
    { label: 'Gerenciar financeiro', allowed: isSuperAdmin },
    { label: 'Reset database', allowed: isSuperAdmin, critical: true },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-32">
      <AdminPageHeader
        title="Configurações de Perfil"
        subtitle="Gerencie sua conta e visualize suas permissões administrativas."
      />

      {/* 1. Header do Perfil */}
      <section className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 to-transparent blur-3xl -z-10" />
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
          <div className="relative group">
            <div className="w-32 h-32 rounded-[2.5rem] bg-slate-900 border-2 border-slate-800 flex items-center justify-center text-5xl font-black italic text-red-600 shadow-2xl overflow-hidden group-hover:border-red-600/50 transition-all">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.fullName} className="w-full h-full object-cover" />
              ) : (
                user.fullName?.substring(0, 2).toUpperCase()
              )}
            </div>
            <div className="absolute -bottom-2 -right-2 bg-emerald-500 p-2 rounded-xl border-4 border-slate-950">
               <CheckCircle2 className="w-4 h-4 text-white" />
            </div>
          </div>

          <div className="text-center md:text-left space-y-2">
            <div className="flex flex-wrap justify-center md:justify-start items-center gap-3">
              <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter">{user.fullName}</h2>
              <Badge className="bg-amber-500 text-black font-black text-[10px] tracking-widest px-4 py-1 rounded-full uppercase">
                {translateRole(user.role)}
              </Badge>
            </div>
            <p className="text-slate-400 font-medium">{user.email}</p>
            <div className="flex gap-4 pt-2">
              <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-500">
                <Clock className="w-3.5 h-3.5" /> Último login: {user.lastLoginAt ? formatFirebaseDate(user.lastLoginAt) : 'Recentemente'}
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-500">
                <Shield className="w-3.5 h-3.5" /> Conta {translateStatus(user.status)}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Coluna Esquerda: Dados Pessoais & Permissões */}
        <div className="lg:col-span-2 space-y-8">

          {/* 2. Dados Pessoais */}
          <Card className="bg-slate-900/50 border-slate-800 rounded-[2rem] shadow-xl backdrop-blur-sm overflow-hidden">
            <CardHeader className="p-8 border-b border-white/5">
              <CardTitle className="text-lg font-black italic uppercase flex items-center gap-3 text-white">
                <User className="w-5 h-5 text-red-600" /> Dados Pessoais
              </CardTitle>
              <CardDescription className="text-slate-500">Mantenha suas informações de contato atualizadas.</CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Nome Completo</Label>
                    <Input
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="bg-slate-950 border-slate-800 rounded-xl focus:ring-red-600"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Telefone / WhatsApp</Label>
                    <Input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="(00) 00000-0000"
                      className="bg-slate-950 border-slate-800 rounded-xl focus:ring-red-600"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">E-mail (Somente Leitura)</Label>
                    <Input value={user.email} disabled className="bg-slate-950 border-slate-800 rounded-xl opacity-50 cursor-not-allowed" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Organização / Arena</Label>
                    <Input
                      value={organization}
                      onChange={(e) => setOrganization(e.target.value)}
                      className="bg-slate-950 border-slate-800 rounded-xl focus:ring-red-600"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Cidade</Label>
                    <Input
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="bg-slate-950 border-slate-800 rounded-xl focus:ring-red-600"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">UF / Estado</Label>
                    <Input
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      maxLength={2}
                      className="bg-slate-950 border-slate-800 rounded-xl focus:ring-red-600 uppercase"
                    />
                  </div>
                </div>
                <div className="flex justify-end pt-4">
                  <Button type="submit" disabled={saving} className="bg-red-600 hover:bg-red-700 text-white font-black uppercase text-xs tracking-widest px-8 rounded-xl h-12">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <RefreshCcw className="w-4 h-4 mr-2" />}
                    Salvar Alterações
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* 4. Permissões */}
          <Card className="bg-slate-900/50 border-slate-800 rounded-[2rem] shadow-xl backdrop-blur-sm overflow-hidden">
            <CardHeader className="p-8 border-b border-white/5">
              <CardTitle className="text-lg font-black italic uppercase flex items-center gap-3 text-white">
                <Shield className="w-5 h-5 text-amber-500" /> Nível de Permissões
              </CardTitle>
              <CardDescription className="text-slate-500">Recursos habilitados para sua função administrativa.</CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {permissions.map((perm, i) => (
                  <div key={i} className={cn(
                    "flex items-center justify-between p-4 rounded-2xl border transition-all",
                    perm.allowed ? "bg-emerald-500/5 border-emerald-500/10" : "bg-slate-950 border-slate-800 opacity-50",
                    perm.critical && perm.allowed && "bg-red-600/5 border-red-600/10"
                  )}>
                    <span className={cn(
                      "text-[10px] font-black uppercase tracking-widest",
                      perm.allowed ? "text-slate-200" : "text-slate-600",
                      perm.critical && "text-red-500"
                    )}>
                      {perm.label}
                    </span>
                    {perm.allowed ? (
                      <CheckCircle2 className={cn("w-5 h-5", perm.critical ? "text-red-500" : "text-emerald-500")} />
                    ) : (
                      <XCircle className="w-5 h-5 text-slate-700" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Coluna Direita: Segurança, Preferências & Auditoria */}
        <div className="space-y-8">

          {/* 3. Segurança */}
          <Card className="bg-slate-900/50 border-slate-800 rounded-[2rem] shadow-xl backdrop-blur-sm overflow-hidden">
            <CardHeader className="p-6 border-b border-white/5 bg-slate-950/30">
              <CardTitle className="text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2 text-white">
                <Lock className="w-4 h-4 text-red-600" /> Segurança
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <Button onClick={handleResetPassword} variant="outline" className="w-full justify-start border-slate-800 bg-slate-950 h-14 rounded-2xl gap-4 hover:border-red-600/50 group">
                <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-slate-500 group-hover:text-red-500">
                  <Key className="w-4 h-4" />
                </div>
                <div className="text-left">
                   <p className="text-[10px] font-black uppercase tracking-widest text-slate-200">Alterar Senha</p>
                   <p className="text-[9px] text-slate-500 font-bold uppercase">Envia e-mail de redefinição</p>
                </div>
              </Button>

              <Button variant="outline" className="w-full justify-start border-slate-800 bg-slate-950 h-14 rounded-2xl gap-4 hover:border-blue-600/50 group">
                <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-slate-500 group-hover:text-blue-500">
                  <Laptop className="w-4 h-4" />
                </div>
                <div className="text-left">
                   <p className="text-[10px] font-black uppercase tracking-widest text-slate-200">Sessões Ativas</p>
                   <p className="text-[9px] text-slate-500 font-bold uppercase">Gerenciar dispositivos</p>
                </div>
              </Button>

              <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl flex gap-3">
                 <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                 <p className="text-[9px] text-amber-500/80 font-bold uppercase leading-relaxed">
                   Ações críticas como Reset de Database exigem reautenticação imediata por motivos de segurança.
                 </p>
              </div>
            </CardContent>
          </Card>

          {/* 6. Preferências */}
          <Card className="bg-slate-900/50 border-slate-800 rounded-[2rem] shadow-xl backdrop-blur-sm overflow-hidden">
            <CardHeader className="p-6 border-b border-white/5 bg-slate-950/30">
              <CardTitle className="text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2 text-white">
                <Settings className="w-4 h-4 text-slate-400" /> Preferências
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
               {[
                 { icon: <Eye className="w-4 h-4" />, label: 'Tema Visual', value: 'Dark Edition' },
                 { icon: <Bell className="w-4 h-4" />, label: 'Notificações', value: 'Habilitado' },
                 { icon: <Languages className="w-4 h-4" />, label: 'Idioma', value: 'Português' },
               ].map((pref, i) => (
                 <div key={i} className="flex items-center justify-between p-3 bg-slate-950 border border-white/5 rounded-xl">
                    <div className="flex items-center gap-3">
                       <span className="text-slate-500">{pref.icon}</span>
                       <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{pref.label}</span>
                    </div>
                    <span className="text-[10px] font-black text-red-600 uppercase">{pref.value}</span>
                 </div>
               ))}
            </CardContent>
          </Card>

          {/* 7. Auditoria da Conta */}
          <Card className="bg-slate-900/50 border-slate-800 rounded-[2rem] shadow-xl backdrop-blur-sm overflow-hidden">
            <CardHeader className="p-6 border-b border-white/5 bg-slate-950/30">
              <CardTitle className="text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2 text-white">
                <History className="w-4 h-4 text-emerald-500" /> Auditoria da Conta
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
               <div className="space-y-4">
                  <div className="flex gap-4">
                     <div className="w-0.5 bg-slate-800 relative">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-red-600 rounded-full" />
                     </div>
                     <div className="space-y-1">
                        <p className="text-[10px] font-black text-white uppercase tracking-widest">Conta Criada</p>
                        <p className="text-[9px] text-slate-500 font-bold uppercase">{formatFirebaseDate(user.createdAt)}</p>
                     </div>
                  </div>
                  <div className="flex gap-4">
                     <div className="w-0.5 bg-slate-800 relative">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-blue-600 rounded-full" />
                     </div>
                     <div className="space-y-1">
                        <p className="text-[10px] font-black text-white uppercase tracking-widest">Última Atualização</p>
                        <p className="text-[9px] text-slate-500 font-bold uppercase">{user.updatedAt ? formatFirebaseDate(user.updatedAt) : 'Sem alterações'}</p>
                     </div>
                  </div>
               </div>

               <Button variant="ghost" className="w-full text-slate-500 hover:text-white font-black uppercase text-[10px] tracking-widest h-10 rounded-xl">
                  Ver Logs de Ação Completos
               </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
