import { NextResponse } from "next/server";
import { manageLinkParams, manageUrl } from "@/lib/manage-link";
import { markSubscribersSent, verifySubscriberByToken } from "@/db/subscribers";
import { generateTickerBlurbs, hasAnthropicConfig } from "@/lib/newsletter/generate-brief";
import { getTickerSnapshots, hasFmpConfig } from "@/lib/newsletter/market-data";
import { hasSesConfig } from "@/lib/newsletter/ses";
import { sendDigestToSubscriber } from "@/lib/newsletter/send-digest";
import { sendWelcomeEmail } from "@/lib/newsletter/send-welcome-email";

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
    new URL(`/welcome?email=${encodeURIComponent(subscriber.email)}&${manageLinkParams(subscriber.unsubscribeToken)}`, request.url),
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

  // Always send welcome email
  try {
    await sendWelcomeEmail({
      to: subscriber.email,
      tickers: subscriber.tickers,
      briefUrl: `${baseUrl}/brief`,
      manageUrl: manageUrl(baseUrl, subscriber.unsubscribeToken),
    });
  } catch (error) {
    console.error("verify: failed to send welcome email", error);
  }

  // Send first briefing if fully configured
  if (!hasFmpConfig() || !hasAnthropicConfig()) {
    console.info("verify: skipping first briefing (missing FMP or Anthropic config)");
    return;
  }

  try {
    const snapshots = await getTickerSnapshots(subscriber.tickers);
    const blurbs = await generateTickerBlurbs(Array.from(snapshots.values()));

    const result = await sendDigestToSubscriber({ subscriber, snapshots, blurbs, baseUrl });
    if (result.sent) {
      await markSubscribersSent([subscriber.id]);
    }
  } catch (error) {
    console.error("verify: failed to send first briefing", error);
  }
}
