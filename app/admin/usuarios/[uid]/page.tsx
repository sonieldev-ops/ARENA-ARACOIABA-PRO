'use client';

import { useUserDetailAdmin } from '@/src/modules/users/hooks/useUserDetailAdmin';
import { AuditTimeline } from '@/src/modules/users/components/AuditTimeline';
import { UserRoleBadge } from '@/src/modules/users/components/UserRoleBadge';
import { UserStatusBadge } from '@/src/modules/users/components/UserStatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, User, Mail, Phone, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function UserDetailPage() {
  const { uid } = useParams();
  const router = useRouter();
  const { user, logs, loading, error } = useUserDetailAdmin(uid as string);

  if (loading) return <div className="p-8">Carregando detalhes...</div>;
  if (error || !user) return <div className="p-8 text-red-500">Erro: {error || 'Usuário não encontrado'}</div>;

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Voltar para Lista
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Perfil e Status */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5" />
              Perfil
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h2 className="text-xl font-bold">{user.fullName}</h2>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              <UserRoleBadge role={user.role} />
              <UserStatusBadge status={user.status} />
            </div>

            <div className="pt-4 space-y-2 border-t text-sm">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{user.email}</span>
              </div>
              {user.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{user.phone}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Cadastrado em: {user.createdAt?.toDate ? format(user.createdAt.toDate(), "dd/MM/yyyy", { locale: ptBR }) : '-'}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Linha do Tempo de Auditoria */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              Histórico de Auditoria
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AuditTimeline logs={logs} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
