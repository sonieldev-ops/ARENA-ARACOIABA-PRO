import { createHash, randomBytes } from "crypto";

/**
 * Gera um token aleatório de alta entropia para ser enviado no link.
 */
export function generateToken(): string {
  return randomBytes(32).toString("hex");
}

/**
 * Gera um hash SHA-256 do token para armazenamento seguro no Firestore.
 */
export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
