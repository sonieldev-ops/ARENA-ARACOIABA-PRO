'use client';

import { Trophy, LogOut, LayoutDashboard, User, Settings } from "lucide-react";
import Link from "next/image";
import LinkNext from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { UserProfile } from "@/src/types/auth";
import { authService } from "@/src/modules/auth/services/auth.service";
import { useRouter } from "next/navigation";

interface NavbarProps {
  user: UserProfile | null;
}

export function Navbar({ user }: NavbarProps) {
  const router = useRouter();

  const handleLogout = async () => {
    await authService.logout();
    router.refresh();
    router.push('/');
  };

  return (
    <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <LinkNext href="/" className="flex items-center gap-2">
          <div className="bg-blue-600 p-1.5 rounded-lg">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">
            ARENA ARACOIABA <span className="text-blue-600">PRO</span>
          </span>
        </LinkNext>

        <nav className="hidden md:flex items-center gap-8">
          <LinkNext href="/#campeonatos" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Campeonatos</LinkNext>
          <LinkNext href="/#jogos" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Jogos Ao Vivo</LinkNext>
          <LinkNext href="/#classificacao" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Classificação</LinkNext>
        </nav>

        <div className="flex items-center gap-4">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10 border border-slate-200">
                    <AvatarImage src={user.photoUrl} alt={user.fullName} />
                    <AvatarFallback className="bg-blue-50 text-blue-600 font-bold">
                      {user.fullName.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.fullName}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <LinkNext href="/admin/dashboard" className="cursor-pointer">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    <span>Painel Admin</span>
                  </LinkNext>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <LinkNext href="/admin/profile" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>Meu Perfil</span>
                  </LinkNext>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <LinkNext href="/admin/settings" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Configurações</span>
                  </LinkNext>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-600 focus:text-red-600 cursor-pointer"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <LinkNext
                href="/login"
                className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
              >
                Entrar
              </LinkNext>
              <LinkNext
                href="/register"
                className="px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-full shadow-lg shadow-blue-200 transition-all active:scale-95"
              >
                Criar Conta
              </LinkNext>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
