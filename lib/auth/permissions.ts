import { UserRole } from '@/src/types/auth';

export const PUBLIC_PATHS = [
  '/',
  '/login',
  '/register',
  '/forgot-password',
  '/championships',
  '/partidas',
  '/standings',
  '/teams',
  '/athletes',
  '/news',
  '/unauthorized',
] as const;

type ProtectedRule = {
  prefix: string;
  roles: UserRole[];
};

export const PROTECTED_RULES: ProtectedRule[] = [
  {
    prefix: '/admin',
    roles: [UserRole.SUPER_ADMIN, UserRole.ORGANIZER, UserRole.REFEREE, UserRole.STAFF],
  },
  {
    prefix: '/admin/campeonatos',
    roles: [UserRole.SUPER_ADMIN, UserRole.ORGANIZER],
  },
  {
    prefix: '/admin/times',
    roles: [UserRole.SUPER_ADMIN, UserRole.ORGANIZER, UserRole.STAFF],
  },
  {
    prefix: '/admin/atletas',
    roles: [UserRole.SUPER_ADMIN, UserRole.ORGANIZER, UserRole.STAFF],
  },
  {
    prefix: '/admin/partidas',
    roles: [UserRole.SUPER_ADMIN, UserRole.ORGANIZER, UserRole.REFEREE, UserRole.STAFF],
  },
  {
    prefix: '/admin/standings',
    roles: [UserRole.SUPER_ADMIN, UserRole.ORGANIZER, UserRole.REFEREE],
  },
  {
    prefix: '/admin/finance',
    roles: [UserRole.SUPER_ADMIN, UserRole.ORGANIZER],
  },
  {
    prefix: '/admin/notifications',
    roles: [UserRole.SUPER_ADMIN, UserRole.ORGANIZER, UserRole.STAFF],
  },
  {
    prefix: '/admin/settings',
    roles: [UserRole.SUPER_ADMIN],
  },
  {
    prefix: '/team',
    roles: [UserRole.TEAM_MANAGER],
  },
  {
    prefix: '/athlete',
    roles: [UserRole.ATHLETE],
  },
];

export function isPublicRoute(pathname: string) {
  return PUBLIC_PATHS.some((path) =>
    path === '/' ? pathname === '/' : pathname === path || pathname.startsWith(`${path}/`)
  );
}

export function getAllowedRolesForPath(pathname: string): UserRole[] | null {
  const match = PROTECTED_RULES
    .filter((rule) => pathname === rule.prefix || pathname.startsWith(`${rule.prefix}/`))
    .sort((a, b) => b.prefix.length - a.prefix.length)[0];

  return match?.roles ?? null;
}

export function hasRequiredRole(role: UserRole | undefined, allowed: UserRole[]) {
  return !!role && allowed.includes(role);
}
