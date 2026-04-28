import { cert, getApp, getApps, initializeApp, App } from "firebase-admin/app";
import { Auth, getAuth } from "firebase-admin/auth";
import { Firestore, getFirestore } from "firebase-admin/firestore";
import { Messaging, getMessaging } from "firebase-admin/messaging";

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value || !value.trim()) return "";
  return value;
}

function getPrivateKey(): string {
  let key = process.env.FIREBASE_ADMIN_PRIVATE_KEY || "";
  if (!key || key.includes("COLE_AQUI")) return "";
  key = key.replace(/^["']|["']$/g, '');
  return key.replace(/\\n/g, "\n");
}

let adminApp: App | undefined;

try {
  const projectId = getRequiredEnv("FIREBASE_ADMIN_PROJECT_ID");
  const clientEmail = getRequiredEnv("FIREBASE_ADMIN_CLIENT_EMAIL");
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

export const adminAuth = (adminApp ? getAuth(adminApp) : null) as Auth;
export const adminDb = (adminApp ? getFirestore(adminApp) : null) as Firestore;
export const adminMessaging = (adminApp ? getMessaging(adminApp) : null) as Messaging;
export { adminApp };
