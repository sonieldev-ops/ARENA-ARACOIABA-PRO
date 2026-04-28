import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Utility to merge tailwind classes safely.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Sanitizes data from Firestore to be safe for React state and serialization.
 * Removes internal Firebase objects that can cause issues.
 */
export function sanitizeData(data: unknown): any {
  if (data === null || data === undefined) return data;

  const d = data as any;

  // 1. Se for um Timestamp do Firestore (tem .toDate()), mantemos intacto
  if (typeof d.toDate === 'function') {
    return d;
  }

  // 2. Detectar e neutralizar objetos internos do Firebase que quebram o React (FieldValue, DocumentReference, etc)
  if (typeof d === 'object') {
    if (d._methodName || d.bc !== undefined || d.firestore !== undefined) {
      return "";
    }
  }

  // Handle Firestore Timestamp (Literal object from serialization)
  if (d._seconds !== undefined || d.seconds !== undefined) {
    const s = d._seconds ?? d.seconds;
    return new Date(s * 1000).toISOString();
  }

  if (Array.isArray(d)) {
    return d.map(sanitizeData);
  }

  if (typeof d === 'object') {
    const sanitized: Record<string, unknown> = {};
    for (const key in d) {
      if (Object.prototype.hasOwnProperty.call(d, key)) {
        sanitized[key] = sanitizeData(d[key]);
      }
    }
    return sanitized;
  }

  return d;
}

/**
 * Formats a Firebase Timestamp or Date into a Brazilian Portuguese locale string.
 */
export function formatFirebaseDate(date: any): string {
  if (!date) return "";

  // Se for Timestamp do Firestore (Client SDK)
  if (date.seconds !== undefined && date.nanoseconds !== undefined) {
    return new Date(date.seconds * 1000).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  // Se for Timestamp do Firestore (Admin SDK / API)
  if (date._seconds !== undefined) {
    return new Date(date._seconds * 1000).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  // Se já for Date
  if (date instanceof Date) {
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  // Se for string ISO ou timestamp number
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return String(date);
    return d.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return String(date);
  }
}

/**
 * Recursively removes undefined values from an object.
 * Useful before sending data to Firestore which doesn't allow undefined.
 */
export function removeUndefined<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  const d = obj as any;

  // Evitar processar objetos internos do Firebase (FieldValue, Timestamp)
  if (d._methodName || typeof d.toDate === 'function') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return (obj as any[])
      .filter((v) => v !== undefined)
      .map((v) => removeUndefined(v)) as unknown as T;
  }

  return Object.fromEntries(
    Object.entries(obj)
      .filter(([, value]) => value !== undefined)
      .map(([key, value]) => [key, removeUndefined(value)])
  ) as T;
}

export const translateRole = (role: string): string => {
  const roles: Record<string, string> = {
    SUPER_ADMIN: "Super Administrador",
    ADMIN: "Administrador",
    ORGANIZER: "Organizador",
    REFEREE: "Árbitro",
    STAFF: "Equipe Técnica",
    TEAM_MANAGER: "Gestor de Time",
    ATHLETE: "Atleta",
    PUBLIC_USER: "Torcedor",
  };
  return roles[role] || role;
};

export const translateStatus = (status: string): string => {
  const statuses: Record<string, string> = {
    PENDING_APPROVAL: "Pendente",
    ACTIVE: "Ativo",
    SUSPENDED: "Suspenso",
    BLOCKED: "Bloqueado",
    REJECTED: "Rejeitado",
    DEACTIVATED: "Desativado",
    SCHEDULED: "Agendado",
    LIVE: "Ao Vivo",
    FINISHED: "Finalizado",
    APPROVED: "Aprovado",
    INACTIVE: "Inativo",
  };
  return statuses[status] || status;
};

export const translateAction = (action: string): string => {
  const actions: Record<string, string> = {
    START_MATCH: "Início de Partida",
    FINISH_MATCH: "Encerramento de Partida",
    REGISTER_GOAL: "Registro de Gol",
    REGISTER_YELLOW_CARD: "Registro de Cartão Amarelo",
    REGISTER_RED_CARD: "Registro de Cartão Vermelho",
    REGISTER_SUBSTITUTION: "Registro de Substituição",
    CREATE_CHAMPIONSHIP: "Criação de Campeonato",
    UPDATE_CHAMPIONSHIP: "Atualização de Campeonato",
    DELETE_CHAMPIONSHIP: "Exclusão de Campeonato",
    CREATE_TEAM: "Criação de Time",
    UPDATE_TEAM: "Atualização de Time",
    DELETE_TEAM: "Exclusão de Time",
    APPROVE_USER: "Aprovação de Usuário",
    REJECT_USER: "Rejeição de Usuário",
    BLOCK_USER: "Bloqueio de Usuário",
  };
  return actions[action] || action.replace(/_/g, ' ');
};

export const translateEventType = (type: string): string => {
  const types: Record<string, string> = {
    'GOAL': 'GOL',
    'YELLOW_CARD': 'CARTÃO AMARELO',
    'RED_CARD': 'CARTÃO VERMELHO',
    'SUBSTITUTION': 'SUBSTITUIÇÃO',
    'MATCH_STARTED': 'PARTIDA INICIADA',
    'START': 'PARTIDA INICIADA',
    'MATCH_FINISHED': 'PARTIDA FINALIZADA',
    'END': 'PARTIDA FINALIZADA',
    'MATCH_PAUSED': 'PARTIDA PAUSADA',
    'MATCH_RESUMED': 'PARTIDA REINICIADA',
    'OBSERVATION': 'OBSERVAÇÃO',
  };
  return types[type] || type.replace(/_/g, ' ');
};

/**
 * Registers a critical action in the system audit log.
 */
export async function logSystemAction(db: unknown, user: any, action: string, details: string, extra: Record<string, unknown> = {}) {
  try {
    const { addDoc, collection, serverTimestamp } = await import('firebase/firestore');
    await addDoc(collection(db as any, 'system_audit_logs'), {
      userId: user?.uid || 'SYSTEM',
      userName: user?.fullName || user?.displayName || 'Sistema',
      email: user?.email || 'N/A',
      role: user?.role || 'N/A',
      action,
      details,
      timestamp: serverTimestamp(),
      ...extra
    });
  } catch (e) {
    console.error('Falha ao registrar log de auditoria:', e);
  }
}
