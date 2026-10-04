import type { Metadata } from "next";
import Link from "next/link";
import { LearnShell, SignupCta } from "@/components/learn-shell";
import { StockLookupBox } from "@/components/stock-lookup-box";
import { indexableStocks } from "@/lib/learn/stocks";
import styles from "../learn.module.css";

export const metadata: Metadata = {
  title: "Stocks Explained Like You're 5: Guides to Popular US Stocks | Metric Finance",
  description: "Plain English guides to popular US stocks. See what each company does, how it makes money and what moves its stock price. Search any Nasdaq or NYSE stock.",
  alternates: { canonical: "/learn/stocks" },
};

export default function StocksDirectoryPage() {
  const groups = new Map<string, ReturnType<typeof indexableStocks>>();
  for (const entry of indexableStocks()) {
    const sector = entry.profile?.sector ?? entry.guide?.group ?? "Other";
    groups.set(sector, [...(groups.get(sector) ?? []), entry]);
  }
  return (
    <LearnShell crumbs={[{ name: "Learn", href: "/learn" }, { name: "Stock guides", href: "/learn/stocks" }]}>
      <span className={styles.eyebrow}>Stock guides</span>
      <h1 className={styles.h1}>Stocks explained like you&apos;re 5</h1>
      <p className={styles.lead}>
        Look up any stock listed on the Nasdaq or New York Stock Exchange, or browse popular companies by sector below. Each guide covers what the company does, how it makes money and what moves its stock.
      </p>
      <StockLookupBox />
      {[...groups].map(([sector, items]) => (
        <section key={sector}>
          <h2 className={styles.groupTitle}>{sector}</h2>
          <ul className={styles.grid}>
            {items.map((entry) => (
              <li key={entry.slug}>
                <Link href={`/learn/stocks/${entry.slug}`}>
                  <strong>{entry.stock.symbol}</strong>
                  <span>{entry.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
      <SignupCta title="Follow your stocks every day" body="Free. Posted on the site every trading day at 5 PM ET." />
      <p className={styles.note}>Educational information, not financial advice.</p>
    </LearnShell>
  );
}
