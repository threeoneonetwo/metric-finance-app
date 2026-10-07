"use client";

import posthog from "posthog-js";
import { isOwner } from "@/lib/gtag";

export type PostHogEventName =
  | "landing_view"
  | "search_open"
  | "search_submit"
  | "report_view"
  | "share_report"
  | "analysis_run"
  | "product_active"
  | "user_active"
  | "user_signout"
  | "signup_started"
  | "share_clicked"
  | "brief_question_submitted";

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

// The browser's anonymous PostHog id, so a signup can be tied back to the visit that led to it.
export function getPostHogVisitorId(): string | undefined {
  if (typeof window === "undefined" || !process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN || !posthog.__loaded) return undefined;
  return posthog.get_distinct_id();
}
