import { LoginForm } from '@/modules/auth/components/LoginForm';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

export const metadata = {
  title: 'Login | Arena Aracoiaba Pro',
  description: 'Acesse o sistema de gestão esportiva Arena Aracoiaba Pro.',
};

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px]">
      <div className="w-full flex flex-col items-center">
        {/* Logo / Branding */}
        <div className="mb-8 text-center animate-in fade-in slide-in-from-top-4 duration-700">
          <h1 className="text-4xl font-black tracking-tighter text-slate-900 italic">
            ARENA <span className="text-blue-600">ARACOIABA</span> PRO
          </h1>
          <p className="text-slate-500 font-medium mt-1">Gestão de Alta Performance</p>
        </div>

        <Suspense fallback={
          <div className="flex items-center justify-center p-20 border rounded-xl bg-white shadow-sm">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        }>
          <LoginForm />
        </Suspense>

        {/* Footer info */}
        <div className="mt-8 text-xs text-slate-400 text-center space-y-2">
          <p>© {new Date().getFullYear()} Arena Aracoiaba Pro. Todos os direitos reservados.</p>
          <div className="flex items-center justify-center gap-4">
            <a href="#" className="hover:text-slate-600 underline">Privacidade</a>
            <a href="#" className="hover:text-slate-600 underline">Suporte</a>
          </div>
        </div>
      </div>
    </main>
  );
}
