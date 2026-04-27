import { RegisterForm } from '@/modules/auth/components/RegisterForm';
import { ShieldCheck } from 'lucide-react';

export const metadata = {
  title: 'Cadastro | Arena Aracoiaba Pro',
  description: 'Crie sua conta no Arena Aracoiaba Pro',
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Coluna Esquerda: Estética e Branding */}
      <div className="hidden lg:flex flex-col justify-between bg-blue-600 p-12 text-white bg-[url('https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=2000')] bg-cover bg-center relative">
        <div className="absolute inset-0 bg-blue-900/60 backdrop-blur-sm" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-8">
            <div className="bg-white p-2 rounded-lg">
              <ShieldCheck className="h-6 w-6 text-blue-600" />
            </div>
            <span className="text-2xl font-bold tracking-tighter">ARENA ARACOIABA PRO</span>
          </div>

          <div className="space-y-6 max-w-lg">
            <h1 className="text-5xl font-extrabold leading-tight">
              Faça parte da elite do esporte amador.
            </h1>
            <p className="text-xl text-blue-100">
              Gerencie times, acompanhe campeonatos e tenha seu perfil de atleta profissional.
            </p>
          </div>
        </div>

        <div className="relative z-10 text-sm text-blue-200">
          © 2024 Arena Aracoiaba Pro. Todos os direitos reservados.
        </div>
      </div>

      {/* Coluna Direita: Formulário */}
      <div className="flex items-center justify-center p-8 bg-slate-50 relative">
        <div className="absolute top-8 right-8 lg:hidden">
           <span className="text-blue-600 font-bold tracking-tighter">ARENA ARACOIABA PRO</span>
        </div>
        <RegisterForm />
      </div>
    </div>
  );
}
