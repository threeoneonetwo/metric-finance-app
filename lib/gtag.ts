export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export const OWNER_OPT_OUT_KEY = "metric_owner";

type GtagCommand = "config" | "event" | "js";

type GtagParams = Record<string, string | number | boolean | null | undefined>;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (command: GtagCommand, target: string | Date, params?: GtagParams) => void;
    [key: `ga-disable-${string}`]: boolean;
  }
}

export function isOwner() {
  if (typeof window === "undefined") return false;

  try {
    return window.localStorage.getItem(OWNER_OPT_OUT_KEY) === "1";
  } catch {
    return false;
  }
}

export function applyOwnerOptOutFromUrl() {
  if (typeof window === "undefined") return false;

  try {
    const params = new URLSearchParams(window.location.search);

    if (params.get("owner") !== "1") {
      return isOwner();
    }

    window.localStorage.setItem(OWNER_OPT_OUT_KEY, "1");

    if (GA_MEASUREMENT_ID) {
      window[`ga-disable-${GA_MEASUREMENT_ID}`] = true;
    }

    return true;
  } catch {
    return isOwner();
  }
}

export function pageview(url: string) {
  if (!GA_MEASUREMENT_ID || typeof window === "undefined" || isOwner()) {
    return;
  }

  getGtag()("config", GA_MEASUREMENT_ID, {
    page_path: url,
  });
}

export function trackEvent(eventName: string, params: GtagParams = {}) {
  if (!GA_MEASUREMENT_ID || typeof window === "undefined" || isOwner()) {
    return;
  }

  getGtag()("event", eventName, params);
}

function getGtag() {
  window.dataLayer = window.dataLayer ?? [];
  window.gtag =
    window.gtag ??
    function gtag(...args) {
      window.dataLayer?.push(args);
    };

  return window.gtag;
}
