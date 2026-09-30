import { NextResponse } from "next/server";
import { findSubscriberByEmail } from "@/db/subscribers";
import { gatherBriefFacts } from "@/lib/newsletter/brief-data";
import { hasFmpConfig } from "@/lib/newsletter/market-data";
import { hasSesConfig } from "@/lib/newsletter/ses";
import { sendDigestToSubscriber } from "@/lib/newsletter/send-digest";
import { hasBriefWriterConfig } from "@/lib/newsletter/write-brief";

export const maxDuration = 30;

/**
 * Sends one real digest to one already-signed-up subscriber, on demand.
 * Lets us verify the pipeline works without waiting for the daily cron
 * or touching any other subscriber. Auth-gated with the same CRON_SECRET
 * as the scheduled send.
 *
 * Usage: GET /api/test-send?email=someone@example.com
 * Header: Authorization: Bearer <CRON_SECRET>
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!hasFmpConfig() || !hasBriefWriterConfig() || !hasSesConfig()) {
    return NextResponse.json({ error: "Newsletter send is not fully configured" }, { status: 503 });
  }

  const email = new URL(request.url).searchParams.get("email");
  if (!email) {
    return NextResponse.json({ error: "Missing ?email= query param" }, { status: 400 });
  }

  const subscriber = await findSubscriberByEmail(email);
  if (!subscriber) {
    return NextResponse.json({ error: "No subscriber found with that email" }, { status: 404 });
  }
  if (subscriber.tickers.length === 0) {
    return NextResponse.json({ error: "That subscriber has no tickers in their watchlist" }, { status: 400 });
  }

  const facts = await gatherBriefFacts(subscriber.tickers);
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://metricfinance.app";

  const result = await sendDigestToSubscriber({ subscriber, facts, baseUrl });

  return NextResponse.json({
    ok: result.sent,
    email: subscriber.email,
    tickers: subscriber.tickers,
    reason: result.sent ? undefined : result.reason,
  });
}
