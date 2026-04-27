import { UserProfile } from '@/src/types/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, ExternalLink, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function UserTeamLinkCard({ user }: { user: UserProfile }) {
  if (!user.teamId) {
    return (
      <Card className="h-full border-dashed">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2 text-slate-400">
            <Users className="h-5 w-5" />
            Vínculo com Equipe
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-6 text-center">
          <p className="text-sm text-slate-400 mb-4">Este usuário não está vinculado a nenhuma equipe no momento.</p>
          <Button variant="outline" size="sm" disabled>
            Vincular Equipe
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Users className="h-5 w-5 text-blue-600" />
          Equipe Vinculada
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
          <div className="bg-white p-2 rounded-md shadow-sm">
            <Shield className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-blue-400 uppercase">ID da Equipe</p>
            <p className="text-sm font-mono text-blue-900">{user.teamId}</p>
          </div>
        </div>

        <Link href={`/admin/teams/${user.teamId}`} passHref>
          <Button className="w-full" variant="secondary">
            <ExternalLink className="mr-2 h-4 w-4" /> Ver Detalhes da Equipe
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
