import { LoginForm } from '@/components/auth/login-form';
import { Suspense } from 'react';

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-4">
      <div className="w-full max-w-md">
        <h1 className="mb-6 text-3xl font-bold text-white">Entrar</h1>
        <Suspense fallback={<div className="text-white">Carregando...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
