import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BriefFrame } from "@/components/brief-frame";
import { BriefAsk } from "@/components/brief-ask";
import { ShareCard } from "@/components/share-card";
import { RequestManageLink } from "@/components/request-manage-link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import landing from "@/components/newsletter-landing.module.css";
import styles from "@/components/brief-view.module.css";
import { getBriefingForSubscriber } from "@/db/briefings";
import type { StoredBriefFacts } from "@/db/schema";
import { hoursSince, isInternalEmail, trackServer } from "@/lib/analytics-server";
import { resolveSubscriber } from "@/lib/session-server";

export const metadata: Metadata = {
  title: "Your brief | Metric Finance",
  robots: { index: false, follow: false },
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type BriefViewProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ token?: string; exp?: string; sig?: string }>;
};

export default async function BriefViewPage({ params, searchParams }: BriefViewProps) {
  const { id } = await params;
  const { token, exp, sig } = await searchParams;
  if (!UUID.test(id)) notFound();

  const { subscriber, creds } = await resolveSubscriber({ token, exp, sig });
  const briefing = subscriber ? await getBriefingForSubscriber(id, subscriber.id) : null;

  if (!subscriber || !briefing) {
    return (
      <main>
        <div className={landing.page}>
          <SiteHeader />
          <section className={landing.manageSection}>
            <div className={landing.manageInner}>
              <h1 className={landing.manageHeading}>That link has expired</h1>
              <p className={landing.manageSub}>
                For your security, brief links expire after 30 days. Enter your email and we&apos;ll send you a fresh link to your dashboard, where every brief is saved.
              </p>
              <RequestManageLink />
              <Link className={landing.manageBack} href="/">Back to Metric Finance</Link>
            </div>
          </section>
          <SiteFooter />
        </div>
      </main>
    );
  }

  await trackServer({
    event: "brief_opened",
    distinctId: subscriber.id,
    properties: {
      internal: isInternalEmail(subscriber.email),
      briefing_id: briefing.id,
      hours_since_sent: hoursSince(briefing.sentAt),
    },
  });

  const date = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    weekday: "long",
    month: "short",
    day: "numeric",
  }).format(briefing.sentAt);
  const dashboard = `/manage?${new URLSearchParams(creds!)}`;
  const starters = starterQuestions(briefing.tickers, briefing.facts);

  return (
    <main>
      <div className={styles.page}>
        <SiteHeader />
        <div className={styles.main}>
          <span className={styles.eyebrow}><i /> Your daily brief</span>
          <h1 className={styles.title}>{date}</h1>
          <ul className={styles.tickers} aria-label="Stocks in this brief">
            {briefing.tickers.map((ticker) => <li key={ticker}>{ticker}</li>)}
          </ul>
          <div className={styles.frameWrap}>
            <BriefFrame html={briefing.html} title={`Metric Finance brief for ${date}`} />
          </div>
          <BriefAsk briefingId={briefing.id} tickers={briefing.tickers} starters={starters} creds={creds!} />
          <ShareCard page="brief" />
          <div className={styles.actions}>
            <Link href={dashboard}>Your dashboard</Link>
          </div>
          <p className={styles.note}>Not financial advice. Market data may be delayed.</p>
        </div>
        <SiteFooter />
      </div>
    </main>
  );
}

// Three easy first questions, built from the brief's own data so they are always in scope.
function starterQuestions(tickers: string[], facts: StoredBriefFacts | null) {
  const moves = (facts?.tickers ?? []).filter((item) => typeof item.changePercent === "number");
  const biggest = [...moves].sort((a, b) => Math.abs(b.changePercent!) - Math.abs(a.changePercent!))[0];
  const lead = biggest?.ticker ?? tickers[0];
  const verb = biggest ? (biggest.changePercent! >= 0 ? "rise" : "fall") : "move";
  const other = tickers.find((ticker) => ticker !== lead);
  return [
    `Why did ${lead} ${verb} today?`,
    "Explain today's idea with an example",
    other ? `What's coming up next for ${other}?` : `What does ${lead} actually sell?`,
  ];
}
