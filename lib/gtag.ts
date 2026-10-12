import { stripSensitiveParams } from "./analytics-privacy";

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

// The owner's own devices are never tracked. The flag lives in local storage and in a long lived cookie
// (Safari can wipe script storage after 7 days; the proxy also sets the cookie server side, which Safari keeps).
export const OWNER_COOKIE = "mf_owner";
const OWNER_COOKIE_MAX_AGE = 60 * 60 * 24 * 730;

export function isOwner() {
  if (typeof window === "undefined") return false;

  try {
    if (window.localStorage.getItem(OWNER_OPT_OUT_KEY) === "1") return true;
  } catch {
    // Storage can be blocked; the cookie still works.
  }
  return document.cookie.split("; ").includes(`${OWNER_COOKIE}=1`);
}

/** Marks this browser as one of the owner's devices: no PostHog, no Google Analytics, from now on. */
export function markOwner() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(OWNER_OPT_OUT_KEY, "1");
  } catch {
    // The cookie below is enough.
  }
  document.cookie = `${OWNER_COOKIE}=1; Max-Age=${OWNER_COOKIE_MAX_AGE}; Path=/; SameSite=Lax; Secure`;
  if (GA_MEASUREMENT_ID) window[`ga-disable-${GA_MEASUREMENT_ID}`] = true;
}

/** `?owner=1` marks this browser as the owner's; `?owner=0` undoes it. */
export function applyOwnerOptOutFromUrl() {
  if (typeof window === "undefined") return false;

  try {
    const flag = new URLSearchParams(window.location.search).get("owner");
    if (flag === "1") markOwner();
    if (flag === "0") {
      window.localStorage.removeItem(OWNER_OPT_OUT_KEY);
      document.cookie = `${OWNER_COOKIE}=; Max-Age=0; Path=/`;
    }
  } catch {
    // Fall through to the stored flag.
  }
  return isOwner();
}

export function pageview(url: string) {
  if (!GA_MEASUREMENT_ID || typeof window === "undefined" || isOwner()) {
    return;
  }

  const clean = stripSensitiveParams(url);
  getGtag()("config", GA_MEASUREMENT_ID, {
    page_path: clean,
    page_location: `${window.location.origin}${clean}`,
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
