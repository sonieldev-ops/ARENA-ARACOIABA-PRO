import { cert, getApp, getApps, initializeApp, App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value || !value.trim()) return "";
  return value;
}

function getPrivateKey(): string {
  let key = process.env.FIREBASE_ADMIN_PRIVATE_KEY || process.env.FIREBASE_PRIVATE_KEY || "";
  if (!key || key.includes("COLE_AQUI")) return "";
  key = key.replace(/^["']|["']$/g, '');
  return key.replace(/\\n/g, "\n");
}

let adminApp: App | undefined;

try {
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL || process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = getPrivateKey();

  if (projectId && clientEmail && privateKey && privateKey.includes("BEGIN PRIVATE KEY")) {
    adminApp = getApps().length > 0
      ? getApp()
      : initializeApp({
          credential: cert({
            projectId,
            clientEmail,
            privateKey,
          }),
        });
    console.log("✅ [Firebase Admin] Inicializado com sucesso.");
  } else {
    console.warn("⚠️ [Firebase Admin] Credenciais incompletas no .env.local. Algumas funções de servidor estarão desativadas.");
  }
} catch (error) {
  console.error("❌ [Firebase Admin] Erro ao inicializar:", error);
}

export const adminAuth = adminApp ? getAuth(adminApp) : null as any;
export const adminDb = adminApp ? getFirestore(adminApp) : null as any;
export { adminApp };
