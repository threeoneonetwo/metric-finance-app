import { after } from "next/server";
import { headers } from "next/headers";
import { getClientIp } from "@/lib/request-metadata";

// Product events that happen on the server (confirming an email, opening a brief) are sent to PostHog so the
// dashboard can show the whole journey. Subscribers are identified only by a random id, never by email.
const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com";

// Our own accounts and test addresses are flagged so the dashboard can leave them out.
const INTERNAL_EMAILS = new Set(["vanshpandita11@gmail.com", "vp@metricfinance.app"]);

export function isInternalEmail(email: string) {
  const address = email.toLowerCase();
  // Plus aliases of our own inboxes (vanshpandita11+anything@gmail.com) are ours too.
  const [local = "", domain = ""] = address.split("@");
  const base = `${local.split("+")[0]}@${domain}`;
  return (
    INTERNAL_EMAILS.has(address) ||
    INTERNAL_EMAILS.has(base) ||
    address.endsWith("@simulator.amazonses.com") ||
    address.endsWith("@example.invalid") ||
    /\+test/.test(address.split("@")[0] ?? "")
  );
}

type Properties = Record<string, string | number | boolean | null | undefined>;

async function send(body: Record<string, unknown>) {
  if (!POSTHOG_KEY) return;
  try {
    await fetch(`${POSTHOG_HOST}/capture/`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ api_key: POSTHOG_KEY, ...body }),
      signal: AbortSignal.timeout(3000),
    });
  } catch {
    // Analytics must never break a signup or a send.
  }
}

export type ServerEvent = {
  event: string;
  distinctId: string;
  properties?: Properties;
  // Lets PostHog work out the visitor's country and city.
  ip?: string;
  // Set the person's id link: merges an anonymous browser into the subscriber.
  anonymousId?: string;
};

function payload({ event, distinctId, properties, ip, anonymousId }: ServerEvent) {
  return {
    event,
    distinct_id: distinctId,
    timestamp: new Date().toISOString(),
    properties: {
      ...properties,
      ...(ip ? { $ip: ip } : {}),
      ...(anonymousId ? { $anon_distinct_id: anonymousId } : {}),
      $lib: "metric-finance-server",
    },
  };
}

// Sends after the response has gone out, so it never slows a page down.
export async function trackServer(input: Omit<ServerEvent, "ip">) {
  let ip: string | undefined;
  try {
    ip = getClientIp(await headers());
  } catch {
    // Not inside a request (a cron job): no visitor location.
  }
  const body = payload({ ...input, ip });
  try {
    after(() => send(body));
  } catch {
    await send(body);
  }
}

// For code that already waits on everything it does, such as the daily send.
export async function trackServerNow(input: ServerEvent) {
  await send(payload(input));
}

export function hoursSince(date: Date) {
  return Math.round((Date.now() - date.getTime()) / 3600000);
}
