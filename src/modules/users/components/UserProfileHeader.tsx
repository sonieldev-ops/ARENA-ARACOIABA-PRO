import { UserProfile } from '@/src/types/auth';
import { UserRoleBadge } from './UserRoleBadge';
import { UserStatusBadge } from './UserStatusBadge';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Copy, Mail, Phone } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function UserProfileHeader({ user }: { user: UserProfile }) {
  const router = useRouter();

  const copyUid = () => {
    navigator.clipboard.writeText(user.uid);
    toast.success('UID copiado!');
  };

  return (
    <div className="bg-white border-b px-8 py-6">
      <div className="max-w-7xl mx-auto">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="mb-4 -ml-2 text-slate-500"
        >
          <ChevronLeft className="h-4 w-4 mr-1" /> Voltar
        </Button>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <Avatar className="h-20 w-20 border-2 border-slate-100">
              <AvatarImage src={user.photoUrl} alt={user.fullName} />
              <AvatarFallback className="text-2xl bg-slate-100 text-slate-600">
                {user.fullName.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="space-y-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold text-slate-900">{user.fullName}</h1>
                <UserRoleBadge role={user.role} />
                <UserStatusBadge status={user.status} />
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                <span className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" /> {user.email}
                </span>
                {user.phone && (
                  <span className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5" /> {user.phone}
                  </span>
                )}
                <button
                  onClick={copyUid}
                  className="flex items-center gap-1.5 hover:text-slate-900 transition-colors"
                >
                  <Copy className="h-3.5 w-3.5" />
                  <span className="font-mono text-[10px] bg-slate-50 px-1.5 py-0.5 rounded border">
                    {user.uid}
                  </span>
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Ações primárias poderiam ser injetadas aqui */}
          </div>
        </div>
      </div>
    </div>
  );
}
