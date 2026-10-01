import { NextResponse } from "next/server";
import { manageLinkParams } from "@/lib/manage-link";
import { markSubscribersSent, verifySubscriberByToken } from "@/db/subscribers";
import { gatherBriefFacts } from "@/lib/newsletter/brief-data";
import { hasFmpConfig } from "@/lib/newsletter/market-data";
import { hasSesConfig } from "@/lib/newsletter/ses";
import { sendDigestToSubscriber } from "@/lib/newsletter/send-digest";
import { hasBriefWriterConfig } from "@/lib/newsletter/write-brief";

export const maxDuration = 30;

// Email security scanners prefetch links, so GET only shows a confirm button page; the POST does the work.
export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token");
  const destination = new URL("/verify", request.url);
  if (token && /^[a-f0-9]{48}$/.test(token)) destination.searchParams.set("token", token);
  else destination.searchParams.set("error", "invalid");
  return NextResponse.redirect(destination, 307);
}

export async function POST(request: Request) {
  const form = await request.formData().catch(() => null);
  const token = form?.get("token");
  if (typeof token !== "string" || !token) {
    return NextResponse.redirect(new URL("/verify?error=invalid", request.url), 303);
  }

  const subscriber = await verifySubscriberByToken(token);
  if (!subscriber) {
    return NextResponse.redirect(new URL("/verify?error=invalid", request.url), 303);
  }

  await sendFirstBriefing(subscriber);

  return NextResponse.redirect(
    new URL(`/manage?${manageLinkParams(subscriber.unsubscribeToken)}&welcome=1`, request.url),
    303,
  );
}

async function sendFirstBriefing(subscriber: { id: string; email: string; tickers: string[]; unsubscribeToken: string }) {
  if (subscriber.tickers.length === 0) return;
  if (!hasSesConfig()) {
    console.error("verify: SES is not configured");
    return;
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://metricfinance.app";

  // Send first briefing if fully configured
  if (!hasFmpConfig() || !hasBriefWriterConfig()) {
    console.info("verify: skipping first briefing (missing FMP or Anthropic config)");
    return;
  }

  try {
    const facts = await gatherBriefFacts(subscriber.tickers);
    const result = await sendDigestToSubscriber({ subscriber, facts, baseUrl });
    if (result.sent) {
      await markSubscribersSent([subscriber.id]);
    }
  } catch (error) {
    console.error("verify: failed to send first briefing", error);
  }
}
