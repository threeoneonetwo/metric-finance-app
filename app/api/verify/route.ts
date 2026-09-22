import { NextResponse } from "next/server";
import { markSubscribersSent, verifySubscriberByToken } from "@/db/subscribers";
import { generateTickerBlurbs, hasAnthropicConfig } from "@/lib/newsletter/generate-brief";
import { getTickerSnapshots, hasFmpConfig } from "@/lib/newsletter/market-data";
import { hasSesConfig } from "@/lib/newsletter/ses";
import { sendDigestToSubscriber } from "@/lib/newsletter/send-digest";

export const maxDuration = 30;

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token");
  if (!token) {
    return new NextResponse("Missing verification token.", { status: 400 });
  }

  const subscriber = await verifySubscriberByToken(token);
  if (!subscriber) {
    return new NextResponse("That confirmation link is invalid or has already been used.", { status: 404 });
  }

  await sendFirstBriefing(subscriber);

  return NextResponse.redirect(
    new URL(`/welcome?email=${encodeURIComponent(subscriber.email)}&token=${subscriber.unsubscribeToken}`, request.url),
  );
}

async function sendFirstBriefing(subscriber: { id: string; email: string; tickers: string[]; unsubscribeToken: string }) {
  if (subscriber.tickers.length === 0) return;
  if (!hasFmpConfig() || !hasAnthropicConfig() || !hasSesConfig()) {
    console.error("verify: newsletter send is not fully configured, skipping first briefing");
    return;
  }

  try {
    const snapshots = await getTickerSnapshots(subscriber.tickers);
    const blurbs = await generateTickerBlurbs(Array.from(snapshots.values()));
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://metricfinance.app";

    const result = await sendDigestToSubscriber({ subscriber, snapshots, blurbs, baseUrl });
    if (result.sent) {
      await markSubscribersSent([subscriber.id]);
    }
  } catch (error) {
    console.error("verify: failed to send first briefing", error);
  }
}
