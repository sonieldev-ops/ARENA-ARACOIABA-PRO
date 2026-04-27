import { UserRole, UserStatus } from "@/src/types/auth";

export interface AccessState {
  role: UserRole;
  status: UserStatus;
  isApproved: boolean;
  approvalRequired?: boolean;
}

export interface RoutingResult {
  route: string;
  kind: 'DASHBOARD' | 'RESTRICTION' | 'PUBLIC';
  reason: string;
  forceLogout?: boolean;
}

/**
 * RESOLVEDOR CENTRAL DE ACESSO
 * Esta é a única fonte de verdade para decidir para onde um usuário deve ir.
 */
export function resolveDefaultRouteByAccess(input: AccessState): RoutingResult {
  const { role, status, isApproved } = input;

  // 1. Verificação de Status Restritivos (Prioridade Máxima)
  if (status === UserStatus.BLOCKED) {
    return { route: '/access/blocked', kind: 'RESTRICTION', reason: 'User is blocked', forceLogout: true };
  }

  if (status === UserStatus.REJECTED) {
    return { route: '/access/rejected', kind: 'RESTRICTION', reason: 'User application was rejected' };
  }

  if (status === UserStatus.SUSPENDED) {
    return { route: '/access/suspended', kind: 'RESTRICTION', reason: 'User is temporarily suspended' };
  }

  if (status === UserStatus.DEACTIVATED) {
    return { route: '/access/deactivated', kind: 'RESTRICTION', reason: 'Account deactivated' };
  }

  // 2. Verificação de Aprovação Pendente
  if (!isApproved || status === UserStatus.PENDING_APPROVAL) {
    return { route: '/pending-approval', kind: 'RESTRICTION', reason: 'Awaiting administrator approval' };
  }

  // 3. Mapeamento de Dashboard por Role (Apenas usuários ativos e aprovados chegam aqui)
  switch (role) {
    case UserRole.SUPER_ADMIN:
    case UserRole.ORGANIZER:
      return { route: '/admin', kind: 'DASHBOARD', reason: 'Management access' };

    case UserRole.REFEREE:
      return { route: '/admin/partidas', kind: 'DASHBOARD', reason: 'Operational referee access' };

    case UserRole.STAFF:
      return { route: '/admin/times', kind: 'DASHBOARD', reason: 'Operational staff access' };

    case UserRole.TEAM_MANAGER:
      return { route: '/team', kind: 'DASHBOARD', reason: 'Team management access' };

    case UserRole.ATHLETE:
      return { route: '/athlete', kind: 'DASHBOARD', reason: 'Athlete personal portal' };

    case UserRole.PUBLIC_USER:
      return { route: '/', kind: 'PUBLIC', reason: 'General public access' };

    default:
      return { route: '/', kind: 'PUBLIC', reason: 'Unknown role fallback' };
  }
}

/**
 * Verifica se o status do usuário impede o uso normal do sistema
 */
export function isAccessRestrictedStatus(status: UserStatus): boolean {
  return [
    UserStatus.BLOCKED,
    UserStatus.SUSPENDED,
    UserStatus.REJECTED,
    UserStatus.DEACTIVATED,
    UserStatus.PENDING_APPROVAL
  ].includes(status);
}
