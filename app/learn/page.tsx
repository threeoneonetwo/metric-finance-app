import type { Metadata } from "next";
import Link from "next/link";
import { LearnShell, SignupCta } from "@/components/learn-shell";
import { StockLookupBox } from "@/components/stock-lookup-box";
import { listLearnArticles } from "@/db/learn";
import { GUIDES } from "@/lib/learn/guides";
import { comparePairs, indexableStocks } from "@/lib/learn/stocks";
import { TERMS } from "@/lib/learn/terms";
import styles from "./learn.module.css";

export const metadata: Metadata = {
  title: "Learn Stocks and Investing in Plain English | Metric Finance",
  description: "Free beginner guides to stocks and investing. Understand any US stock, learn the key terms and see how companies compare, all explained like you're 5.",
  alternates: { canonical: "/learn" },
};

export const revalidate = 1800;

export default async function LearnPage() {
  const [recaps, newGuides] = await Promise.all([listLearnArticles("market-today", 1), listLearnArticles("guide", 6)]);
  const latest = recaps[0];
  const popular = indexableStocks().slice(0, 12);
  const pairs = comparePairs().slice(0, 6);
  return (
    <LearnShell crumbs={[{ name: "Learn", href: "/learn" }]}>
      <span className={styles.eyebrow}>Learn</span>
      <h1 className={styles.h1}>Learn stocks and investing in plain English</h1>
      <p className={styles.lead}>
        Free guides that explain how stocks work, what the jargon means and what is going on with the companies you care about. No finance degree needed.
      </p>
      <StockLookupBox />

      {latest && (
        <Link className={styles.card} href={`/learn/market-today/${latest.publishedOn}`} style={{ display: "block", textDecoration: "none", color: "inherit", marginTop: 28 }}>
          <span className={styles.eyebrow}>Latest market recap</span>
          <h2 style={{ marginTop: 10 }}>{latest.title}</h2>
          <p style={{ margin: 0, color: "#b7c2dd", fontSize: 16, lineHeight: 1.7 }}>{latest.intro}</p>
        </Link>
      )}

      <h2 className={styles.groupTitle}>Beginner guides</h2>
      <ul className={styles.cards}>
        {[...newGuides.map((guide) => ({ slug: guide.slug, title: guide.title, description: guide.description })), ...GUIDES].slice(0, 8).map((guide) => (
          <li key={guide.slug}>
            <Link href={`/learn/guides/${guide.slug}`}>
              <strong>{guide.title.split(":")[0]}</strong>
              <span>{guide.description}</span>
            </Link>
          </li>
        ))}
      </ul>

      <p className={styles.related}><Link href="/learn/guides">See all guides</Link> · <Link href="/learn/market-today">Daily market recaps</Link></p>

      <h2 className={styles.groupTitle}>Popular stocks explained</h2>
      <ul className={styles.chips}>
        {popular.map((entry) => (
          <li key={entry.slug}><Link href={`/learn/stocks/${entry.slug}`}>{entry.name} ({entry.stock.symbol})</Link></li>
        ))}
        <li><Link href="/learn/stocks">See all stock guides</Link></li>
      </ul>

      <h2 className={styles.groupTitle}>Stock market glossary</h2>
      <ul className={styles.chips}>
        {TERMS.slice(0, 14).map((term) => (
          <li key={term.slug}><Link href={`/learn/terms/${term.slug}`}>{term.term}</Link></li>
        ))}
        <li><Link href="/learn/terms">See all {TERMS.length} terms</Link></li>
      </ul>

      <h2 className={styles.groupTitle}>Stock comparisons</h2>
      <ul className={styles.chips}>
        {pairs.map(([a, b]) => (
          <li key={`${a.slug}-${b.slug}`}><Link href={`/learn/compare/${a.slug}-vs-${b.slug}`}>{a.stock.symbol} vs {b.stock.symbol}</Link></li>
        ))}
      </ul>

      <SignupCta title="Get your stocks explained every day" body="Pick up to five stocks and read a free brief on them every trading day at 5 PM ET." />
      <p className={styles.note}>Educational information, not financial advice.</p>
    </LearnShell>
  );
}
