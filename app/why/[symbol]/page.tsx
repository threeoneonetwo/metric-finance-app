// Every "why did this stock move" explainer for one stock, like /why/nvda, newest first. Stocks with no explainers yet
// get a button to make one and are kept out of search results until they have one.
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { listWhyPagesForSymbol } from "@/db/why";
import { InstantExplainer } from "@/components/instant-explainer";
import { LearnShell, SignupCta } from "@/components/learn-shell";
import { WhyCard, whyHref } from "@/components/why-card";
import { findStock } from "@/lib/learn/stocks";
import { longDate, percentText } from "@/lib/why";
import styles from "@/app/learn/learn.module.css";

type Props = { params: Promise<{ symbol: string }> };

export const revalidate = 86400;
export function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const entry = findStock((await params).symbol);
  if (!entry) return {};
  const pages = await listWhyPagesForSymbol(entry.stock.symbol);
  const title = `Why Is ${entry.name} (${entry.stock.symbol}) Stock Up or Down? | Metric Finance`;
  const description = `What happened to ${entry.stock.symbol} at each close and why, explained in plain words. A new explainer after every trading day.`;
  return {
    title,
    description,
    alternates: { canonical: `/why/${entry.slug}` },
    robots: pages.length > 0 ? undefined : { index: false, follow: true },
  };
}

export default async function WhyStockPage({ params }: Props) {
  const entry = findStock((await params).symbol);
  if (!entry) notFound();
  const pages = await listWhyPagesForSymbol(entry.stock.symbol);
  const [latest, ...earlier] = pages;

  return (
    <LearnShell crumbs={[{ name: "Why stocks moved", href: "/why" }, { name: entry.stock.symbol, href: `/why/${entry.slug}` }]}>
      <span className={styles.eyebrow}>{entry.stock.exchange}: {entry.stock.symbol}</span>
      <h1 className={styles.h1}>Why is {entry.name} ({entry.stock.symbol}) stock up or down?</h1>
      <p className={styles.lead}>What happened to {entry.stock.symbol} at the close, and why, in words anyone can follow.</p>

      {latest ? (
        <>
          <h2 className={styles.groupTitle}>Latest: {latest.explainer.sessionLabel}</h2>
          <WhyCard explainer={latest.explainer} title="h3" shareLink />
        </>
      ) : (
        <InstantExplainer from="learn" symbol={entry.stock.symbol} name={entry.name} />
      )}

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

      <SignupCta
        title={`Follow ${entry.stock.symbol} in your daily brief`}
        body={`Each trading day at 5 PM ET we post what happened to ${entry.name} and your other stocks, and why. Free.`}
      />
      <p className={styles.related}>
        <Link href={`/learn/stocks/${entry.slug}`}>What {entry.name} does, explained simply</Link> · <Link href="/why">Why stocks moved</Link>
      </p>
    </LearnShell>
  );
}
