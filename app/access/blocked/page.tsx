import { ShieldAlert, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function BlockedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 px-4 text-center">
      <div className="mb-6 rounded-full bg-red-500/10 p-6 ring-1 ring-red-500/20">
        <ShieldAlert className="h-16 w-16 text-red-500" />
      </div>
      <h1 className="mb-2 text-4xl font-bold text-white">Acesso Bloqueado</h1>
      <p className="mb-8 max-w-md text-zinc-400">
        Sua conta foi permanentemente bloqueada por violação dos termos de uso da Arena Aracoiaba.
        Se você acredita que isso é um erro, entre em contato com o suporte.
      </p>
      <div className="flex gap-4">
        <Button variant="outline" asChild>
          <Link href="/login">
            <LogOut className="mr-2 h-4 w-4" />
            Voltar ao Login
          </Link>
        </Button>
      </div>
    </div>
  );
}
