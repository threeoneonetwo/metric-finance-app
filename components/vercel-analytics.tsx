"use client";

import { Analytics } from "@vercel/analytics/next";
import { stripSensitiveParams } from "@/lib/analytics-privacy";

export function VercelAnalytics() {
  return <Analytics beforeSend={(event) => ({ ...event, url: stripSensitiveParams(event.url) })} />;
}
