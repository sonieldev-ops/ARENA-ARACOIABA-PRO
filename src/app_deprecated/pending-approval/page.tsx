'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, LogOut, CheckCircle2, ShieldCheck } from 'lucide-react';
import { authService } from '@/src/modules/auth/services/auth.service';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function PendingApprovalPage() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await authService.logout();
      router.replace('/login');
    } catch (error) {
      toast.error('Erro ao sair');
    }
  };

  const handleCheckStatus = async () => {
    const user = await authService.getCurrentUser();
    if (user?.status === 'ACTIVE') {
      toast.success('Sua conta foi aprovada!');
      router.replace('/admin/dashboard');
    } else {
      toast.info('Sua conta ainda está em análise.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px]">
      <Card className="w-full max-w-md text-center shadow-xl border-blue-100 overflow-hidden animate-in fade-in zoom-in-95 duration-500">
        <div className="h-2 bg-blue-600" />
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-blue-50 rounded-full animate-pulse">
              <Clock className="h-10 w-10 text-blue-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Solicitação Recebida!</CardTitle>
          <CardDescription>
            Obrigado por se cadastrar no Arena Aracoiaba Pro.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-blue-50/50 p-4 rounded-lg text-sm text-blue-800 text-left space-y-3 border border-blue-100">
            <div className="flex gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-blue-600" />
              <p className="font-medium">Perfil criado com sucesso.</p>
            </div>
            <div className="flex gap-2 text-slate-600">
              <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5 text-blue-600" />
              <p>Segurança da conta verificada.</p>
            </div>
            <div className="flex gap-2 text-slate-500 italic">
              <Clock className="h-4 w-4 shrink-0 mt-0.5" />
              <p>Aguardando revisão dos administradores.</p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-slate-600 leading-relaxed">
              Para garantir a integridade da plataforma, todos os novos perfis passam por uma análise manual.
            </p>
            <p className="text-xs text-slate-400">
              Você será notificado por e-mail assim que seu acesso for liberado.
            </p>
          </div>

          <div className="pt-6 border-t space-y-3">
            <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={handleCheckStatus}>
              Verificar Status Agora
            </Button>
            <Button variant="ghost" className="w-full text-slate-500 hover:text-slate-900" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Sair e usar outra conta
            </Button>
          </div>
        </CardContent>
        <div className="bg-slate-50 py-3 text-[10px] text-slate-400 border-t uppercase tracking-widest font-bold">
          Compliance & Governance
        </div>
      </Card>
    </div>
  );
}
