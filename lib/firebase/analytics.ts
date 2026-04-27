import type { FirebaseApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";

export async function initFirebaseAnalytics(app: FirebaseApp) {
  if (typeof window === "undefined") return null;
  const supported = await isSupported();
  if (!supported) return null;
  return getAnalytics(app);
}
