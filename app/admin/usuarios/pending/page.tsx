'use client';

import { useEffect, useState } from 'react';
import { adminUserService } from '@/src/modules/admin/services/admin-user.service';
import { UserProfile, UserRole } from '@/types/auth';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle,
  XCircle,
  UserPlus,
  Clock,
  ShieldAlert,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

import { AdminPageHeader } from '@/src/modules/admin/components/AdminPageHeader';
import { Card, CardContent } from '@/components/ui/card';

export default function PendingUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionUid, setActionUid] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await adminUserService.getPendingUsers();
      setUsers(data);
    } catch (error) {
      toast.error('Erro ao carregar solicitações');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (uid: string, requestedRole: UserRole) => {
    setActionUid(uid);
    try {
      const adminUid = 'SYSTEM_ADMIN';
      await adminUserService.approveUser(uid, requestedRole, adminUid);
      toast.success('Usuário aprovado com sucesso!');
      setUsers(users.filter(u => u.uid !== uid));
    } catch (error) {
      toast.error('Falha ao aprovar usuário');
    } finally {
      setActionUid(null);
    }
  };

  const handleReject = async (uid: string) => {
    const reason = window.prompt('Motivo da rejeição:');
    if (!reason) return;

    setActionUid(uid);
    try {
      const adminUid = 'SYSTEM_ADMIN';
      await adminUserService.rejectUser(uid, reason, adminUid);
      toast.success('Solicitação rejeitada.');
      setUsers(users.filter(u => u.uid !== uid));
    } catch (error) {
      toast.error('Falha ao rejeitar usuário');
    } finally {
      setActionUid(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-red-600" />
        <p className="text-slate-500 font-medium">Carregando solicitações...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <AdminPageHeader
        title="Aprovações Pendentes"
        subtitle="Gerencie novos acessos e defina as permissões dos atletas e membros."
        action={
          <Badge variant="outline" className="px-4 py-2 gap-2 border-slate-800 text-slate-400 bg-slate-900/50">
            <Clock className="h-4 w-4 text-amber-500" />
            <span className="font-bold text-white">{users.length}</span> aguardando
          </Badge>
        }
      />

      <Card className="bg-slate-900 border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-slate-800 bg-slate-900/50 hover:bg-slate-900/50">
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500 h-14 px-6">Usuário</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500 h-14 px-6">Perfil Solicitado</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500 h-14 px-6">Data</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500 h-14 px-6 text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-40 text-center text-slate-500 italic">
                    Nenhuma solicitação pendente no momento.
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.uid} className="border-b border-slate-800 hover:bg-slate-800/30 transition-colors">
                    <TableCell className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-white">{user.fullName}</span>
                        <span className="text-xs text-slate-500">{user.email}</span>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <Badge variant="secondary" className="bg-blue-600/10 text-blue-400 hover:bg-blue-600/20 border border-blue-600/20">
                        {user.requestedRole}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-sm text-slate-400 font-medium">
                      {user.createdAt?.toDate?.()?.toLocaleDateString('pt-BR') || 'Recent'}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-slate-500 hover:text-red-500 hover:bg-red-500/10 font-bold uppercase text-[10px] tracking-widest"
                          onClick={() => handleReject(user.uid)}
                          disabled={!!actionUid}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Rejeitar
                        </Button>
                        <Button
                          size="sm"
                          className="bg-red-600 hover:bg-red-700 text-white font-bold uppercase text-[10px] tracking-widest rounded-xl shadow-lg shadow-red-900/20"
                          onClick={() => handleApprove(user.uid, user.requestedRole || UserRole.ATHLETE)}
                          disabled={!!actionUid}
                        >
                          {actionUid === user.uid ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Aprovar
                            </>
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
