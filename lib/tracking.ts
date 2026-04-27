/**
 * ARENA PRO - High Ticket Conversion Tracking System
 * Specialized for CRO and Lead Gen Validation
 */

const DEBUG = true;

export function trackEvent(name: string, data?: any) {
  if (typeof window === "undefined") return;

  if (DEBUG) {
    console.group(`%c[TRACKING]: ${name}`, "color: #FACC15; font-weight: bold; background: #0B0C0E; padding: 2px 6px; border-radius: 4px;");
    if (data) console.log("Data:", data);
    console.log("Timestamp:", new Date().toISOString());
    console.log("URL:", window.location.href);
    console.groupEnd();
  }

  // Integration point for GA4, Facebook Pixel, Posthog, etc.
  // if (window.gtag) window.gtag('event', name, data);
}

export const DATA_TEST_IDS = {
  HERO_CTA: "hero-cta",
  HERO_DEMO: "hero-demo-cta",
  WHATSAPP_FLOATING: "whatsapp-floating",
  WHATSAPP_FINAL: "whatsapp-final-cta",
  PREVIEW_RANKING: "preview-ranking",
  PREVIEW_LIVE: "preview-live",
  SECTION_PROBLEM: "section-problem",
  SECTION_SOLUTION: "section-solution",
};
