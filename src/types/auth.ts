export enum UserRole {
  SUPER_ADMIN = "SUPER_ADMIN",
  ORGANIZER = "ORGANIZER",
  REFEREE = "REFEREE",
  STAFF = "STAFF",
  TEAM_MANAGER = "TEAM_MANAGER",
  ATHLETE = "ATHLETE",
  PUBLIC_USER = "PUBLIC_USER",
}

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}
