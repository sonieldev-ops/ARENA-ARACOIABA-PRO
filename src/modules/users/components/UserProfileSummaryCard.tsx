import { UserProfile } from '@/src/types/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { User, Mail, Phone, Calendar, Clock, Fingerprint } from 'lucide-react';

export function UserProfileSummaryCard({ user }: { user: UserProfile }) {
  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    const d = date?.toDate?.() || new Date(date);
    return format(d, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  };

  const infoItems = [
    { label: 'Nome Completo', value: user.fullName, icon: User },
    { label: 'E-mail', value: user.email, icon: Mail },
    { label: 'Telefone', value: user.phone || 'Não informado', icon: Phone },
    { label: 'Data de Cadastro', value: formatDate(user.createdAt), icon: Calendar },
    { label: 'Última Atualização', value: formatDate(user.updatedAt), icon: Clock },
    { label: 'UID', value: user.uid, icon: Fingerprint, className: 'font-mono text-[11px]' },
  ];

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          Informações Básicas
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        {infoItems.map((item) => (
          <div key={item.label} className="flex items-start gap-3">
            <div className="mt-0.5 bg-slate-50 p-1.5 rounded-md border border-slate-100">
              <item.icon className="h-4 w-4 text-slate-500" />
            </div>
            <div className="space-y-0.5">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                {item.label}
              </p>
              <p className={`text-sm text-slate-700 ${item.className || ''}`}>
                {item.value}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
