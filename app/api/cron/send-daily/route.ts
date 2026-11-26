import { after, NextResponse } from "next/server";
import { listActiveSubscribers, markSubscribersSent } from "@/db/subscribers";
import { isSameBriefDay } from "@/lib/newsletter/brief-day";
import { gatherBriefFacts } from "@/lib/newsletter/brief-data";
import { hasFmpConfig } from "@/lib/newsletter/market-data";
import { trackServerNow } from "@/lib/analytics-server";
import { hasSesConfig } from "@/lib/newsletter/ses";
import { sendDigestToSubscriber, type BriefCache } from "@/lib/newsletter/send-digest";
import { hasBriefWriterConfig } from "@/lib/newsletter/write-brief";
import { refreshLearn } from "@/lib/learn/refresh";
import { refreshWhy } from "@/lib/instant/refresh-why";

export const maxDuration = 300;

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Two UTC schedules cover daylight saving; only the one that lands on 5 PM in New York sends.
  if (!isSendHourInNewYork(new Date())) {
    return NextResponse.json({ ok: true, skipped: "not 5 PM in New York" });
  }

  // After the response is sent (so it never delays the brief), refresh the Learn section: today's market recap,
  // a new guide and a batch of stock pages. It runs after the send so the brief gets the market data quota first.
  after(async () => {
    try {
      console.log("learn refresh:", JSON.stringify(await refreshLearn()));
    } catch (error) {
      console.error("learn refresh failed", error);
    }
  });
  // Alongside it, write "why did it move" pages for the day's biggest movers (/why). Its own deadline keeps it inside the time limit.
  after(async () => {
    try {
      console.log("why refresh:", JSON.stringify(await refreshWhy(Date.now() + 200_000)));
    } catch (error) {
      console.error("why refresh failed", error);
    }
  });

  if (!hasFmpConfig() || !hasBriefWriterConfig() || !hasSesConfig()) {
    return NextResponse.json({ error: "Daily send is not fully configured" }, { status: 503 });
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

  // No email to the owner here any more (they asked to stop the alerts). Failures still show in the Vercel logs and in PostHog as no_brief on daily_send_run.
  if (noBrief > 0) console.error(`send-daily: ${noBrief} of ${subscribers.length} briefs could not be written`);

  await markSubscribersSent(sentIds);

  await trackServerNow({
    event: "daily_send_run",
    distinctId: "system",
    properties: {
      $process_person_profile: false,
      internal: false,
      subscribers: subscribers.length,
      sent: sentIds.length,
      failed: subscribers.length - sentIds.length,
      no_brief: noBrief,
    },
  });

  return NextResponse.json({ ok: true, sent: sentIds.length, subscribers: allActive.length });
}

function isSendHourInNewYork(date: Date) {
  const hour = new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", hour: "2-digit", hour12: false }).format(date);
  return Number(hour) % 24 === 17;
}
