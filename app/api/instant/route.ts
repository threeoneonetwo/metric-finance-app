// The "try it first" endpoint: returns a short explainer for one stock, no signup needed.
// The page only calls it when someone clicks, so crawlers never trigger it. See lib/instant/explain.ts for the cost controls.
import { NextResponse } from "next/server";
import { hitRateLimit } from "@/db/rate-limit";
import { trackServer } from "@/lib/analytics-server";
import { getInstantExplainer } from "@/lib/instant/explain";
import { getClientIp } from "@/lib/request-metadata";

export const maxDuration = 60;

const TICKER_PATTERN = /^[A-Z0-9.]{1,10}$/;
/** Explainers one visitor can ask for per hour (cached ones included). */
const PER_IP_HOURLY = 20;

// Friendly messages for each kind of failure.
const MESSAGES: Record<string, { status: number; text: string }> = {
  unknown_stock: { status: 404, text: "We couldn't find that stock. Try a US listed ticker like AAPL or NVDA." },
  no_data: { status: 503, text: "We couldn't get today's numbers for this stock right now. Try another one, or check back later." },
  busy: { status: 503, text: "We've written a lot of these today. Pick a popular stock, or sign up and we'll explain yours at 5 PM ET." },
  writer_failed: { status: 503, text: "Our writer is taking a break right now. Sign up and we'll explain this stock in your 5 PM ET brief." },
  rate_limited: { status: 429, text: "You've tried a lot of stocks in the last hour. Sign up and we'll explain your favourites every day." },
};

export async function GET(request: Request) {
  const started = Date.now();
  const symbol = (new URL(request.url).searchParams.get("symbol") ?? "").trim().toUpperCase();
  const from = (new URL(request.url).searchParams.get("from") ?? "").slice(0, 20);
  if (!TICKER_PATTERN.test(symbol)) return reply("unknown_stock");

  const ip = getClientIp(request.headers) ?? "unknown";
  const { limited } = await hitRateLimit(`instant:ip:${ip}`, PER_IP_HOURLY, 60 * 60).catch(() => ({ limited: false }));
  if (limited) return reply("rate_limited", symbol, from, started);

  try {
    const explainer = await getInstantExplainer(symbol);
    await trackServer({
      event: "instant_explainer_served",
      distinctId: "anonymous",
      properties: { $process_person_profile: false, symbol, from, status: "ok", latency_ms: Date.now() - started },
    });
    return NextResponse.json({ explainer }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const code = error instanceof Error && error.message in MESSAGES ? error.message : "writer_failed";
    if (!(error instanceof Error && error.message in MESSAGES)) console.error("instant: failed", error);
    return reply(code, symbol, from, started);
  }
}

// Sends a failure reply and records it (status only).
async function reply(code: string, symbol?: string, from?: string, started?: number) {
  const message = MESSAGES[code] ?? MESSAGES.writer_failed;
  if (symbol) {
    await trackServer({
      event: "instant_explainer_served",
      distinctId: "anonymous",
      properties: { $process_person_profile: false, symbol, from, status: code, latency_ms: started ? Date.now() - started : null },
    });
  }
  return NextResponse.json({ error: message.text, code }, { status: message.status, headers: { "Cache-Control": "no-store" } });
}
