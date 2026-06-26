"use client";

import { trackPostHogEvent, type PostHogEventName } from "@/lib/posthog";

type ProductEventPayload = {
  eventName: "landing_view" | "search_open" | "search_submit" | "report_view" | "share_report";
  ticker?: string;
  metadata?: Record<string, unknown>;
};

export function trackProductEvent(payload: ProductEventPayload) {
  if (typeof window === "undefined") return;

  trackPostHogEvent(payload.eventName as PostHogEventName, {
    ticker: payload.ticker,
    ...flattenMetadata(payload.metadata),
  });

  const body = JSON.stringify(payload);

  if (navigator.sendBeacon) {
    const blob = new Blob([body], { type: "application/json" });
    navigator.sendBeacon("/api/product-events", blob);
    return;
  }

  void fetch("/api/product-events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  });
}

function flattenMetadata(metadata?: Record<string, unknown>) {
  if (!metadata) return {};

  return Object.fromEntries(
    Object.entries(metadata)
      .filter(([, value]) => ["string", "number", "boolean"].includes(typeof value) || value === null)
      .map(([key, value]) => [key, value as string | number | boolean | null]),
  );
}
