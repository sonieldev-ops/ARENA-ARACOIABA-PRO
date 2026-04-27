'use client';

import { Send, History, Bell, Search } from 'lucide-react';
import { AdminPageHeader } from '@/src/modules/admin/components/AdminPageHeader';
import { AdminActionButton } from '@/src/modules/admin/components/AdminActionButton';
import { AdminDataTable } from '@/src/modules/admin/components/AdminDataTable';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface NotificationHistory {
  id: string;
  title: string;
  message: string;
  target: string;
  sentAt: string;
  status: string;
}

const mockHistory: NotificationHistory[] = [
  { id: '1', title: 'Nova Partida', message: 'Uma nova partida foi agendada para hoje.', target: 'Todos', sentAt: '10/05/2024 14:00', status: 'SENT' },
  { id: '2', title: 'Alteração de Horário', message: 'O jogo das 20h foi adiado.', target: 'Atletas', sentAt: '09/05/2024 10:30', status: 'SENT' },
];

export default function NotificationsPage() {
  const columns = [
    { header: 'Título', accessorKey: 'title' as keyof NotificationHistory, className: 'font-bold text-white' },
    { header: 'Destinatários', accessorKey: 'target' as keyof NotificationHistory },
    { header: 'Enviado em', accessorKey: 'sentAt' as keyof NotificationHistory },
    { header: 'Status', accessorKey: 'status' as keyof NotificationHistory },
  ];

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Notificações"
        subtitle="Envie notificações push para usuários e atletas."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 space-y-6">
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Send className="h-5 w-5 text-red-600" />
            Nova Notificação
          </h2>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Título</label>
              <Input placeholder="Ex: Gol na Arena!" className="bg-slate-900 border-slate-800 rounded-xl" />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Mensagem</label>
              <Textarea placeholder="Digite o conteúdo da notificação..." className="bg-slate-900 border-slate-800 rounded-xl min-h-[120px]" />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Público-alvo</label>
              <select className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-sm text-slate-300">
                <option>Todos os usuários</option>
                <option>Apenas Atletas</option>
                <option>Apenas Capitães</option>
                <option>Apenas Organizadores</option>
              </select>
            </div>

            <AdminActionButton className="w-full" icon={Send}>
              Enviar Agora
            </AdminActionButton>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <History className="h-5 w-5 text-red-600" />
            Histórico Recente
          </h2>
          <AdminDataTable columns={columns} data={mockHistory} />
        </div>
      </div>
    </div>
  );
}
