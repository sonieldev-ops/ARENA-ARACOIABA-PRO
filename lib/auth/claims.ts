import { UserRole, UserStatus } from '@/src/types/auth';

export function resolveInitialAccess(requestedRole?: UserRole) {
  const sensitiveRoles = new Set<UserRole>([
    UserRole.ORGANIZER,
    UserRole.REFEREE,
    UserRole.STAFF,
    UserRole.TEAM_MANAGER,
    UserRole.ATHLETE,
  ]);

  const normalizedRequestedRole = requestedRole ?? UserRole.PUBLIC_USER;
  const approvalRequired = sensitiveRoles.has(normalizedRequestedRole);

  // Se exigir aprovação, nasce como PUBLIC_USER para não ter privilégios antes da hora
  const role = approvalRequired ? UserRole.PUBLIC_USER : normalizedRequestedRole;
  const status = approvalRequired ? UserStatus.PENDING_APPROVAL : UserStatus.ACTIVE;
  const isApproved = !approvalRequired;

  return {
    requestedRole: normalizedRequestedRole,
    role,
    status,
    isApproved,
    approvalRequired,
  };
}
