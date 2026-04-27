import { UserProfile } from '@/src/types/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Database, Laptop, MapPin } from 'lucide-react';

export function UserMetadataCard({ user }: { user: UserProfile }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Database className="h-5 w-5 text-slate-400" />
          Metadados do Sistema
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-5">
        <div className="flex items-start gap-3">
          <MapPin className="h-4 w-4 text-slate-400 mt-1" />
          <div className="space-y-0.5">
            <p className="text-xs font-medium text-slate-400 uppercase">Localização</p>
            <p className="text-sm text-slate-700">{user.city || 'Cidade não informada'}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Laptop className="h-4 w-4 text-slate-400 mt-1" />
          <div className="space-y-0.5">
            <p className="text-xs font-medium text-slate-400 uppercase">Último Acesso</p>
            <p className="text-sm text-slate-700">
              {user.metadata?.lastLogin ? (user.metadata.lastLogin?.toDate?.() || new Date(user.metadata.lastLogin)).toLocaleString() : 'N/A'}
            </p>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-50">
          <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Preferências JSON</p>
          <pre className="text-[10px] bg-slate-50 p-3 rounded-lg text-slate-500 overflow-auto">
            {JSON.stringify(user.preferences || {}, null, 2)}
          </pre>
        </div>
      </CardContent>
    </Card>
  );
}
