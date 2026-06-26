"use client";

import posthog from "posthog-js";
import { isOwner } from "@/lib/gtag";

export type PostHogEventName =
  | "landing_view"
  | "search_open"
  | "search_submit"
  | "report_view"
  | "share_report"
  | "analysis_run";

type PostHogEventProperties = Record<string, string | number | boolean | null | undefined>;

export function trackPostHogEvent(eventName: PostHogEventName, properties: PostHogEventProperties = {}) {
  if (
    !process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN ||
    typeof window === "undefined" ||
    isOwner() ||
    !posthog.__loaded
  ) {
    return;
  }

  posthog.capture(eventName, properties);
}
