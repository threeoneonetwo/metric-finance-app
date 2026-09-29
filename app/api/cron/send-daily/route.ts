import { NextResponse } from "next/server";
import { listActiveSubscribers, markSubscribersSent } from "@/db/subscribers";
import { isSameBriefDay } from "@/lib/newsletter/brief-day";
import { generateTickerBlurbs, hasAnthropicConfig } from "@/lib/newsletter/generate-brief";
import { getTickerSnapshots, hasFmpConfig } from "@/lib/newsletter/market-data";
import { hasSesConfig, sendEmail } from "@/lib/newsletter/ses";
import { sendDigestToSubscriber } from "@/lib/newsletter/send-digest";

export const maxDuration = 60;

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!hasFmpConfig() || !hasAnthropicConfig() || !hasSesConfig()) {
    return NextResponse.json({ error: "Newsletter send is not fully configured" }, { status: 503 });
  }

  const now = new Date();
  const allActive = await listActiveSubscribers();
  // Someone who verified since the last run (e.g. after 5pm ET) already got an
  // immediate first briefing for this brief day — skip them here to avoid a duplicate.
  const subscribers = allActive.filter(
    (subscriber) => !subscriber.lastSentAt || !isSameBriefDay(subscriber.lastSentAt, now),
  );
  if (subscribers.length === 0) {
    return NextResponse.json({ ok: true, sent: 0, subscribers: allActive.length });
  }

  const allTickers = Array.from(new Set(subscribers.flatMap((subscriber) => subscriber.tickers)));
  const snapshots = await getTickerSnapshots(allTickers);
  const blurbs = await generateTickerBlurbs(Array.from(snapshots.values()));
  if (blurbs.size < snapshots.size) {
    await alertOwner(
      `Metric Finance: ${snapshots.size - blurbs.size} of ${snapshots.size} stock explanations failed`,
      `Today's send could not generate explanations for ${snapshots.size - blurbs.size} of ${snapshots.size} stocks, so those emails went out without them.\n\nMost likely cause: Anthropic API credit ran out or the key is invalid. Check the Vercel logs for "generate-brief" and your Anthropic billing page.`,
    );
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://metricfinance.app";

  let sent = 0;
  const sentIds: string[] = [];

  for (const subscriber of subscribers) {
    try {
      const result = await sendDigestToSubscriber({ subscriber, snapshots, blurbs, baseUrl });
      if (result.sent) {
        sent += 1;
        sentIds.push(subscriber.id);
      }
    } catch {
      // Skip and continue sending to the rest of the list.
    }
  }

  await markSubscribersSent(sentIds);

  return NextResponse.json({ ok: true, sent, subscribers: allActive.length });
}

async function alertOwner(subject: string, text: string) {
  try {
    await sendEmail({ to: process.env.ALERT_EMAIL ?? "vanshpandita11@gmail.com", subject, text, html: `<pre>${text}</pre>` });
  } catch (error) {
    console.error("send-daily: failed to send owner alert", error);
  }
}
