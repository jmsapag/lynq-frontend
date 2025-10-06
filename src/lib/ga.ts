// Minimal GA4 wrapper for React
declare global {
  interface Window {
    dataLayer: unknown[];
    gtag?: (...args: any[]) => void;
  }
}

let initialized = false;
let cachedMeasurementId: string | undefined;

const loadScript = (id: string) =>
  new Promise<void>((resolve, reject) => {
    if (document.getElementById("ga4-script")) return resolve();
    const s = document.createElement("script");
    s.id = "ga4-script";
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Failed to load gtag.js"));
    document.head.appendChild(s);
  });

export async function initGA(measurementId?: string) {
  if (initialized) return;
  if (!measurementId) return;

  cachedMeasurementId = measurementId;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };

  try {
    await loadScript(measurementId);
  } catch {
    return; // fail silently to keep no-op behavior
  }

  window.gtag("js", new Date());
  window.gtag("config", measurementId, {
    send_page_view: false,
    debug_mode: import.meta.env.DEV === true,
  });

  // Default consent (can be updated later via setConsent)
  window.gtag("consent", "default", {
    ad_user_data: "granted",
    ad_personalization: "granted",
    ad_storage: "granted",
    analytics_storage: "granted",
  });

  initialized = true;
}

export function pageview(path: string) {
  if (!initialized || !window.gtag || !cachedMeasurementId) return;
  window.gtag("event", "page_view", { page_path: path });
}

export function setUserId(userId: string) {
  if (!initialized || !window.gtag || !cachedMeasurementId) return;
  window.gtag("config", cachedMeasurementId, { user_id: userId });
}

export function event(name: string, params?: Record<string, unknown>) {
  if (!initialized || !window.gtag) return;
  window.gtag("event", name, params ?? {});
}

export function setUserProperties(props: Record<string, unknown>) {
  if (!initialized || !window.gtag) return;
  window.gtag("set", "user_properties", props);
}

export function setConsent(status: "granted" | "denied") {
  if (!initialized || !window.gtag) return;
  const value = status === "granted" ? "granted" : "denied";
  window.gtag("consent", "update", {
    ad_user_data: value,
    ad_personalization: value,
    ad_storage: value,
    analytics_storage: value,
  });
}

export function isGAInitialized() {
  return initialized;
}


