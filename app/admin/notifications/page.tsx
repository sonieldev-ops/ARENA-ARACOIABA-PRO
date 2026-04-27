'use client';

import { useState } from 'react';
import { Bell, Send, ArrowLeft, Users, Zap, Info, AlertTriangle, Loader2 } from 'lucide-react';
import { AdminPageHeader } from '@/src/modules/admin/components/AdminPageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Link from 'next/link';
import { toast } from 'sonner';

export default function AdminNotificationsPage() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [target, setTarget] = useState('all');
  const [type, setType] = useState('info');
  const [sending, setSending] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) {
      toast.error('Preencha o título e a mensagem.');
      return;
    }

    setSending(true);
    
    try {
      const response = await fetch('/api/admin/notifications/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          message,
          target,
          type
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`Sucesso! ${data.sentCount} notificações enviadas.`);
        setTitle('');
        setMessage('');
      } else {
        toast.error(data.error || 'Erro ao enviar notificações.');
      }
    } catch (error) {
      console.error('Push Error:', error);
      toast.error('Erro de conexão com o servidor.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <AdminPageHeader
        title="Notificações Push"
        subtitle="Envie alertas em tempo real para os torcedores e atletas."
        action={
          <Button variant="outline" className="border-slate-800 text-slate-400 hover:text-white" asChild>
            <Link href="/admin"><ArrowLeft className="mr-2 h-4 w-4" /> Voltar</Link>
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="bg-slate-900 border-slate-800 rounded-3xl overflow-hidden shadow-2xl h-fit">
          <CardHeader className="border-b border-slate-800 p-6">
            <CardTitle className="text-white font-black flex items-center gap-2">
              <Zap className="h-5 w-5 text-red-600" />
              Nova Transmissão
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSend} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Público Alvo</label>
                <Select value={target} onValueChange={setTarget}>
                  <SelectTrigger className="bg-slate-950 border-slate-800 text-white rounded-xl h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-950 border-slate-800 text-white">
                    <SelectItem value="all">Todos os Usuários</SelectItem>
                    <SelectItem value="athletes">Apenas Atletas</SelectItem>
                    <SelectItem value="referees">Apenas Árbitros</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Tipo de Alerta</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'info', label: 'Informativo' },
                    { id: 'success', label: 'Sucesso' },
                    { id: 'warning', label: 'Aviso' }
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setType(t.id)}
                      className={`py-3 rounded-xl border font-bold text-[10px] uppercase tracking-widest transition-all ${
                        type === t.id 
                          ? 'bg-red-600 border-red-600 text-white shadow-lg shadow-red-900/20' 
                          : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-white'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Título da Notificação</label>
                <Input 
                  placeholder="Ex: Grande Final Confirmada!" 
                  className="bg-slate-950 border-slate-800 text-white placeholder:text-slate-700 rounded-xl h-12"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Mensagem</label>
                <Textarea 
                  placeholder="Descreva o conteúdo da notificação..." 
                  className="bg-slate-950 border-slate-800 text-white placeholder:text-slate-700 rounded-xl min-h-[120px]"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full h-14 bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-red-900/20 disabled:opacity-50"
                disabled={sending}
              >
                {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Send className="mr-2 h-5 w-5" /> Disparar Agora</>}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="bg-slate-900 border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
            <CardHeader className="p-6">
               <CardTitle className="text-white font-black flex items-center gap-2">
                <Info className="h-5 w-5 text-blue-600" />
                Como funciona?
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-6 text-slate-400 text-sm space-y-4">
              <p>
                As notificações enviadas por este painel utilizam o <strong>Firebase Cloud Messaging (FCM)</strong> e chegam instantaneamente nos dispositivos móveis dos torcedores e atletas.
              </p>
              <div className="bg-blue-600/10 border border-blue-500/20 p-4 rounded-2xl flex gap-3">
                <Users className="h-5 w-5 text-blue-500 flex-shrink-0" />
                <p className="text-xs">
                  Sua base atual tem <strong>1.240 tokens</strong> ativos prontos para receber mensagens.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800 rounded-3xl overflow-hidden shadow-2xl border-l-4 border-l-amber-500">
            <CardContent className="p-6">
               <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <h4 className="text-white font-bold uppercase text-[10px] tracking-widest mb-1">Aviso Importante</h4>
                  <p className="text-slate-500 text-xs">
                    Evite disparar mais de 3 notificações por dia para não ser marcado como spam pelos sistemas operacionais (Android/iOS).
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
