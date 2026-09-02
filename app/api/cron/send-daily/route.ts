import { NextResponse } from "next/server";
import { listActiveSubscribers, markSubscribersSent } from "@/db/subscribers";
import { buildDigestEmail, generateTickerBlurbs, hasAnthropicConfig } from "@/lib/newsletter/generate-brief";
import { getTickerSnapshots, hasFmpConfig } from "@/lib/newsletter/market-data";
import { hasSesConfig, sendEmail } from "@/lib/newsletter/ses";

export const maxDuration = 60;

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!hasFmpConfig() || !hasAnthropicConfig() || !hasSesConfig()) {
    return NextResponse.json({ error: "Newsletter send is not fully configured" }, { status: 503 });
  }

  const subscribers = await listActiveSubscribers();
  if (subscribers.length === 0) {
    return NextResponse.json({ ok: true, sent: 0, subscribers: 0 });
  }

  const allTickers = Array.from(new Set(subscribers.flatMap((subscriber) => subscriber.tickers)));
  const snapshots = await getTickerSnapshots(allTickers);
  const blurbs = await generateTickerBlurbs(Array.from(snapshots.values()));

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://metricfinance.app";

  let sent = 0;
  const sentIds: string[] = [];

  for (const subscriber of subscribers) {
    const digest = buildDigestEmail({
      tickers: subscriber.tickers,
      snapshots,
      blurbs,
      unsubscribeUrl: `${baseUrl}/api/unsubscribe?token=${subscriber.unsubscribeToken}`,
    });

    if (!digest.hasContent) continue;

    try {
      await sendEmail({
        to: subscriber.email,
        subject: "Your Metric Finance briefing",
        html: digest.html,
        text: digest.text,
      });
      sent += 1;
      sentIds.push(subscriber.id);
    } catch {
      // Skip and continue sending to the rest of the list.
    }
  }

  await markSubscribersSent(sentIds);

  return NextResponse.json({ ok: true, sent, subscribers: subscribers.length });
}
