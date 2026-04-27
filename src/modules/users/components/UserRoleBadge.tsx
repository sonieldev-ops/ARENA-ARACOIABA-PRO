import { UserRole } from '@/src/types/auth';
import { Badge } from '@/components/ui/badge';

const roleConfig: Record<UserRole, { label: string; variant: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "info" }> = {
  [UserRole.SUPER_ADMIN]: { label: 'Super Admin', variant: 'destructive' },
  [UserRole.ORGANIZER]: { label: 'Organizador', variant: 'warning' },
  [UserRole.REFEREE]: { label: 'Árbitro', variant: 'info' },
  [UserRole.STAFF]: { label: 'Staff', variant: 'secondary' },
  [UserRole.TEAM_MANAGER]: { label: 'Gestor de Time', variant: 'success' },
  [UserRole.ATHLETE]: { label: 'Atleta', variant: 'outline' },
  [UserRole.PUBLIC_USER]: { label: 'Público', variant: 'default' },
};

export function UserRoleBadge({ role }: { role: UserRole }) {
  const config = roleConfig[role] || { label: role, variant: 'default' };

  return (
    <Badge variant={config.variant as any} className="whitespace-nowrap">
      {config.label}
    </Badge>
  );
}
