// One "why did this stock move" page, like /why/nvda/2026-11-25: the explainer for one stock and one trading session.
// Pages are made by the homepage search, the Learn stock pages and the daily job for the biggest movers, and never change
// once written. Built on the first visit and then served from the cache, so crawlers don't wake the database.
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getWhyPage, listRecentWhyPages, listWhyPagesForSymbol } from "@/db/why";
import { LearnShell, SignupCta, SITE } from "@/components/learn-shell";
import { WhyCard, whyHref } from "@/components/why-card";
import { findStock } from "@/lib/learn/stocks";
import { direction, isSessionDate, longDate, percentText } from "@/lib/why";
import styles from "@/app/learn/learn.module.css";

type Props = { params: Promise<{ symbol: string; date: string }> };

export const revalidate = 604800;
// None are built at deploy time; each page is built the first time someone visits it.
export function generateStaticParams() {
  return [];
}

// Finds the stock and the saved explainer, or null for an unknown stock, a bad date or a page that doesn't exist yet.
async function load(params: Props["params"]) {
  const { symbol, date } = await params;
  const entry = findStock(symbol);
  if (!entry || !isSessionDate(date)) return null;
  const page = await getWhyPage(entry.stock.symbol, date);
  return page ? { entry, page } : null;
}

// The question people search for, like "Why did Tesla (TSLA) stock go up on November 25, 2026?".
const question = (name: string, symbol: string, change: number | null, date: string) => `Why did ${name} (${symbol}) stock ${direction(change)} on ${longDate(date)}?`;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const found = await load(params);
  if (!found) return {};
  const { entry, page } = found;
  const title = question(entry.name, entry.stock.symbol, page.explainer.changePercent, page.sessionDate);
  const description = page.explainer.oneLiner;
  const url = `${SITE}${whyHref(page.explainer)}`;
  return {
    title: `${title} | Metric Finance`,
    description,
    alternates: { canonical: whyHref(page.explainer) },
    openGraph: { title: page.explainer.headline, description, url, type: "article", siteName: "Metric Finance" },
    twitter: { card: "summary_large_image", title: page.explainer.headline, description },
  };
}

export default async function WhyPage({ params }: Props) {
  const found = await load(params);
  if (!found) notFound();
  const { entry, page } = found;
  const { explainer } = page;
  const [history, recent] = await Promise.all([listWhyPagesForSymbol(entry.stock.symbol), listRecentWhyPages(300)]);
  const earlier = history.filter((item) => item.sessionDate !== page.sessionDate).slice(0, 8);
  const sameDay = recent.filter((item) => item.sessionDate === page.sessionDate && item.symbol !== page.symbol).slice(0, 8);
  const title = question(entry.name, entry.stock.symbol, explainer.changePercent, page.sessionDate);

  const article = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: title,
    description: explainer.oneLiner,
    datePublished: page.sessionDate,
    about: { "@type": "Corporation", name: entry.name, tickerSymbol: entry.stock.symbol },
    publisher: { "@type": "Organization", name: "Metric Finance", url: SITE },
    mainEntityOfPage: `${SITE}${whyHref(explainer)}`,
  };

  return (
    <LearnShell
      crumbs={[{ name: "Why stocks moved", href: "/why" }, { name: entry.stock.symbol, href: `/why/${entry.slug}` }, { name: longDate(page.sessionDate), href: whyHref(explainer) }]}
      jsonLd={[article]}
    >
      <span className={styles.eyebrow}>{entry.stock.exchange}: {entry.stock.symbol} · {explainer.sessionLabel}</span>
      <h1 className={styles.h1}>{title}</h1>

      <WhyCard explainer={explainer} title="h2" />

      <SignupCta
        title={`Get ${entry.stock.symbol} explained like this every trading day`}
        body="Pick up to five stocks and we post a free brief at 5 PM ET on what moved and why, in plain words."
      />

      {earlier.length > 0 && (
        <section>
          <h2 className={styles.groupTitle}>Earlier {entry.stock.symbol} moves</h2>
          <ul className={styles.cards}>
            {earlier.map((item) => (
              <li key={item.sessionDate}>
                <Link href={whyHref(item.explainer)}>
                  <strong>{longDate(item.sessionDate)} · {percentText(item.explainer.changePercent)}</strong>
                  <span>{item.explainer.headline}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {sameDay.length > 0 && (
        <section>
          <h2 className={styles.groupTitle}>Other stocks on {explainer.sessionLabel}</h2>
          <ul className={styles.cards}>
            {sameDay.map((item) => (
              <li key={item.symbol}>
                <Link href={whyHref(item.explainer)}>
                  <strong>{item.symbol} · {percentText(item.explainer.changePercent)}</strong>
                  <span>{item.explainer.headline}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className={styles.related}>
        <Link href={`/learn/stocks/${entry.slug}`}>What {entry.name} does, explained simply</Link> · <Link href={`/why/${entry.slug}`}>Every {entry.stock.symbol} explainer</Link> · <Link href="/why">Why stocks moved</Link>
      </p>
      <p className={styles.note}>Written from the closing prices and the headlines published around that day. Educational information, not financial advice.</p>
    </LearnShell>
  );
}
