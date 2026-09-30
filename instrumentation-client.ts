import posthog from "posthog-js";
import { stripSensitiveParams } from "@/lib/analytics-privacy";
import { applyOwnerOptOutFromUrl } from "@/lib/gtag";

function cleanProperties(properties: Record<string, unknown> | undefined) {
  if (!properties) return;
  for (const [key, value] of Object.entries(properties)) {
    if (typeof value === "string" && /^https?:\/\//i.test(value)) properties[key] = stripSensitiveParams(value);
  }
}

const POSTHOG_PROJECT_TOKEN = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com";

if (POSTHOG_PROJECT_TOKEN && typeof window !== "undefined") {
  const isOwner = applyOwnerOptOutFromUrl();

  if (!isOwner) {
    // Deferred until after load so analytics never delays the first paint.
    const init = () =>
      posthog.init(POSTHOG_PROJECT_TOKEN, {
        api_host: POSTHOG_HOST,
        defaults: "2026-05-30",
        capture_pageview: "history_change",
        before_send: (event) => {
          if (event) {
            cleanProperties(event.properties);
            cleanProperties(event.$set);
            cleanProperties(event.$set_once);
          }
          return event;
        },
        capture_pageleave: true,
      });
    if (document.readyState === "complete") setTimeout(init, 0);
    else window.addEventListener("load", () => setTimeout(init, 0), { once: true });
  }
}
