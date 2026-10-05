import type { Metadata } from "next";
import { ArrowUpRight, BookOpen, LineChart, Newspaper, Spline } from "lucide-react";
import Link from "next/link";
import { LearnShell, SignupCta } from "@/components/learn-shell";
import { CountUp } from "@/components/learn-motion";
import { StockBrowser } from "@/components/stock-browser";
import { StockLookupBox } from "@/components/stock-lookup-box";
import { listLearnArticles } from "@/db/learn";
import { GUIDES } from "@/lib/learn/guides";
import { US_STOCKS } from "@/lib/stock-lookup";
import { comparePairs, indexableStocks, sectorOf } from "@/lib/learn/stocks";
import { TERMS } from "@/lib/learn/terms";
import styles from "./learn.module.css";

export const metadata: Metadata = {
  title: "Learn Stocks and Investing in Plain English: Stock Guides, Terms and Daily Recaps | Metric Finance",
  description: "Free beginner guides to stocks and investing. Understand any US stock, learn the key terms and see how companies compare, all explained like you're 5.",
  alternates: { canonical: "/learn" },
};

export const revalidate = 1800;

export default async function LearnPage() {
  const [recaps, newGuides] = await Promise.all([listLearnArticles("market-today", 1), listLearnArticles("guide", 6)]);
  const latest = recaps[0];
  const groups = new Map<string, ReturnType<typeof indexableStocks>>();
  for (const entry of indexableStocks()) {
    const sector = sectorOf(entry);
    groups.set(sector, [...(groups.get(sector) ?? []), entry]);
  }
  const pairs = comparePairs().slice(0, 6);
  return (
    <LearnShell crumbs={[{ name: "Learn", href: "/learn" }]}>
      <div className={styles.hero}>
        <span className={styles.eyebrow}>Free · Plain English · No jargon</span>
        <h1 className={styles.h1}>Learn stocks and investing in <span className={styles.accent}>plain English</span></h1>
        <p className={styles.lead}>
          Free guides that explain how stocks work, what the jargon means and what is going on with the companies you care about. No finance degree needed.
        </p>
        <StockLookupBox />
        <ul className={styles.heroHints}>
          <li>Try</li>
          {["AAPL", "NVDA", "TSLA", "MSFT"].map((symbol) => (
            <li key={symbol}><Link href={`/learn/stocks/${symbol.toLowerCase()}`}>{symbol}</Link></li>
          ))}
        </ul>
      </div>

      <ul className={styles.stats}>
        <li><strong><CountUp value={US_STOCKS.length} /></strong><span>US stocks searchable</span></li>
        <li><strong><CountUp value={TERMS.length} /></strong><span>terms explained</span></li>
        <li><strong><CountUp value={GUIDES.length + newGuides.length} /></strong><span>beginner guides</span></li>
        <li><strong>Daily</strong><span>market recaps</span></li>
      </ul>

      <ul className={styles.tiles}>
        {[
          { href: "#stocks", icon: <LineChart size={24} />, tone: styles.tileBlue, title: "Stock guides", text: "Any Nasdaq or NYSE stock, explained simply" },
          { href: "/learn/market-today", icon: <Newspaper size={24} />, tone: styles.tileViolet, title: "Market today", text: "A recap after every trading day" },
          { href: "/learn/guides", icon: <BookOpen size={24} />, tone: styles.tileTeal, title: "Beginner guides", text: "One clear idea at a time" },
          { href: "/learn/terms", icon: <Spline size={24} />, tone: styles.tileAmber, title: "Glossary", text: `${TERMS.length} terms in plain words` },
        ].map((tile) => (
          <li key={tile.href}>
            <Link href={tile.href}>
              <span className={styles.tileTop}>
                <span className={`${styles.tileIcon} ${tile.tone}`}>{tile.icon}</span>
                <ArrowUpRight className={styles.tileArrow} size={20} />
              </span>
              <strong>{tile.title}</strong>
              <span className={styles.tileText}>{tile.text}</span>
            </Link>
          </li>
        ))}
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

      <section id="stocks" style={{ scrollMarginTop: 24 }}>
        <h2 className={styles.groupTitle}>Stock guides <small>Any Nasdaq or NYSE stock, explained like you&apos;re 5</small></h2>
        <StockBrowser
          sectors={[...groups.keys()]}
          stocks={[...groups].flatMap(([sector, items]) => items.map((entry) => ({ symbol: entry.stock.symbol, name: entry.name, slug: entry.slug, sector })))}
        />
        <p className={styles.related}>Not listed? Use the search bar above to find any US stock.</p>
      </section>

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
