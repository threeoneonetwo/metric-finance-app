import { NextResponse } from "next/server";
import { listActiveSubscribers, markSubscribersSent } from "@/db/subscribers";
import { isSameBriefDay } from "@/lib/newsletter/brief-day";
import { gatherBriefFacts } from "@/lib/newsletter/brief-data";
import { hasFmpConfig } from "@/lib/newsletter/market-data";
import { hasSesConfig, sendEmail } from "@/lib/newsletter/ses";
import { sendDigestToSubscriber, type BriefCache } from "@/lib/newsletter/send-digest";
import { hasBriefWriterConfig } from "@/lib/newsletter/write-brief";

export const maxDuration = 60;

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!hasFmpConfig() || !hasBriefWriterConfig() || !hasSesConfig()) {
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
  const facts = await gatherBriefFacts(allTickers);
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://metricfinance.app";
  const cache: BriefCache = new Map();

  const sentIds: string[] = [];
  let noBrief = 0;

  // A few at a time keeps the run inside the time limit without hammering the APIs.
  const queue = [...subscribers];
  const worker = async () => {
    for (let subscriber = queue.shift(); subscriber; subscriber = queue.shift()) {
      try {
        const result = await sendDigestToSubscriber({ subscriber, facts, baseUrl, cache });
        if (result.sent) sentIds.push(subscriber.id);
        else if (result.reason === "no-brief") noBrief += 1;
      } catch (error) {
        console.error("send-daily: failed for one subscriber", error);
      }
    }
  };
  await Promise.all(Array.from({ length: 4 }, worker));

  if (noBrief > 0) {
    await alertOwner(
      `Metric Finance: ${noBrief} of ${subscribers.length} briefs could not be written`,
      `Today's send skipped ${noBrief} of ${subscribers.length} subscribers because the brief could not be written, so they got no email.\n\nMost likely cause: Anthropic API credit ran out or the key is invalid. Check the Vercel logs for "write-brief" and your Anthropic billing page.`,
    );
  }

  await markSubscribersSent(sentIds);

  return NextResponse.json({ ok: true, sent: sentIds.length, subscribers: allActive.length });
}

async function alertOwner(subject: string, text: string) {
  try {
    await sendEmail({ to: process.env.ALERT_EMAIL ?? "vanshpandita11@gmail.com", subject, text, html: `<pre>${text}</pre>` });
  } catch (error) {
    console.error("send-daily: failed to send owner alert", error);
  }
}
