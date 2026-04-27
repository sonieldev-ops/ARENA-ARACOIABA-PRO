import { UserRole } from "../../types/auth";

export const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/register",
  "/forgot-password",
  "/championships",
  "/partidas",
  "/standings",
  "/teams",
  "/athletes",
  "/news",
];

export const ROLE_ROUTES: Record<UserRole, string[]> = {
  [UserRole.SUPER_ADMIN]: ["/admin", "/team", "/athlete"], // Acesso total
  [UserRole.ADMIN]: ["/admin", "/team", "/athlete"], // Acesso administrativo total
  [UserRole.ORGANIZER]: [
    "/admin/campeonatos",
    "/admin/times",
    "/admin/atletas",
    "/admin/partidas",
    "/admin/standings",
    "/admin/finance",
    "/admin/notifications",
    "/admin",
  ],
  [UserRole.REFEREE]: [
    "/admin/partidas",
    "/admin/standings",
    "/admin",
  ],
  [UserRole.STAFF]: [
    "/admin/times",
    "/admin/atletas",
    "/admin/partidas",
    "/admin/notifications",
    "/admin",
  ],
  [UserRole.TEAM_MANAGER]: [
    "/team/profile",
    "/team/athletes",
    "/team/matches",
    "/team",
  ],
  [UserRole.ATHLETE]: [
    "/athlete/profile",
    "/athlete/matches",
    "/athlete/notifications",
    "/athlete",
  ],
  [UserRole.PUBLIC_USER]: [],
};

export function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some((route) =>
    pathname === route || pathname.startsWith(`${route}/`)
  );
}

export function hasPermission(role: UserRole, pathname: string): boolean {
  if (role === UserRole.SUPER_ADMIN) return true;

  const allowedRoutes = ROLE_ROUTES[role] || [];
  return allowedRoutes.some((route) =>
    pathname === route || pathname.startsWith(`${route}/`)
  );
}
