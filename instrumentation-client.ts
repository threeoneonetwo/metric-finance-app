import posthog from "posthog-js";

const POSTHOG_PROJECT_TOKEN = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com";
const OPT_OUT_KEY = "metric_owner";

if (POSTHOG_PROJECT_TOKEN && typeof window !== "undefined") {
  let isOwner = false;

  try {
    isOwner = window.localStorage.getItem(OPT_OUT_KEY) === "1";
  } catch {
    isOwner = false;
  }

  if (!isOwner) {
    posthog.init(POSTHOG_PROJECT_TOKEN, {
      api_host: POSTHOG_HOST,
      defaults: "2026-05-30",
      capture_pageview: "history_change",
      capture_pageleave: true,
    });
  }
}
