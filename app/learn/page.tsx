import type { Metadata } from "next";
import { BookOpen, LineChart, Newspaper, Spline } from "lucide-react";
import Link from "next/link";
import { LearnShell, SignupCta } from "@/components/learn-shell";
import { StockLogo } from "@/components/stock-logo";
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
      <h1 className={styles.h1}>Learn stocks and investing in <span className={styles.accent}>plain English</span></h1>
      <p className={styles.lead}>
        Free guides that explain how stocks work, what the jargon means and what is going on with the companies you care about. No finance degree needed.
      </p>
      <StockLookupBox />

      <ul className={styles.tiles}>
        <li><Link href="/learn/stocks"><span className={styles.tileIcon}><LineChart size={22} /></span><strong>Stock guides</strong><span>Any Nasdaq or NYSE stock, explained simply</span></Link></li>
        <li><Link href="/learn/market-today"><span className={styles.tileIcon}><Newspaper size={22} /></span><strong>Market today</strong><span>A recap after every trading day</span></Link></li>
        <li><Link href="/learn/guides"><span className={styles.tileIcon}><BookOpen size={22} /></span><strong>Beginner guides</strong><span>One clear idea at a time</span></Link></li>
        <li><Link href="/learn/terms"><span className={styles.tileIcon}><Spline size={22} /></span><strong>Glossary</strong><span>{TERMS.length} terms in plain words</span></Link></li>
      </ul>

      {latest && (
        <Link className={`${styles.card} ${styles.linkCard} ${styles.featured}`} href={`/learn/market-today/${latest.publishedOn}`} style={{ marginTop: 28 }}>
          <span className={styles.eyebrow} style={{ justifySelf: "start" }}>Latest market recap</span>
          <h2>{latest.title}</h2>
          <p>{latest.intro}</p>
          <span className={styles.readMore}>Read the recap</span>
        </Link>
      )}

      <h2 className={styles.groupTitle}>Latest guides</h2>
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
      <ul className={styles.grid}>
        {popular.map((entry) => (
          <li key={entry.slug}>
            <Link href={`/learn/stocks/${entry.slug}`}>
              <StockLogo symbol={entry.stock.symbol} />
              <span className={styles.gridText}><strong>{entry.stock.symbol}</strong><span>{entry.name}</span></span>
            </Link>
          </li>
        ))}
      </ul>
      <p className={styles.related}><Link href="/learn/stocks">See all stock guides</Link></p>

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
