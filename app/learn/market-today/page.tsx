import type { Metadata } from "next";
import Link from "next/link";
import { LearnShell, SignupCta } from "@/components/learn-shell";
import { listLearnArticles } from "@/db/learn";
import styles from "../learn.module.css";

export const revalidate = 1800;

export const metadata: Metadata = {
  title: "Stock Market Today: Daily Recap in Plain English | Metric Finance",
  description: "How did the stock market do today? A short daily recap of the S&P 500, Nasdaq and Dow, the biggest movers and why, explained like you're 5.",
  alternates: { canonical: "/learn/market-today" },
};

export default async function MarketTodayIndex() {
  const recaps = await listLearnArticles("market-today", 90);
  const [latest, ...older] = recaps;
  return (
    <LearnShell crumbs={[{ name: "Learn", href: "/learn" }, { name: "Market today", href: "/learn/market-today" }]}>
      <span className={styles.eyebrow}>Market today</span>
      <h1 className={styles.h1}>Stock market today, explained like you&apos;re 5</h1>
      <p className={styles.lead}>A short recap after every trading day: how the market did, what moved and what to learn from it.</p>
      {latest ? (
        <Link className={styles.card} href={`/learn/market-today/${latest.publishedOn}`} style={{ display: "block", textDecoration: "none", color: "inherit" }}>
          <h2>{latest.title}</h2>
          <p style={{ margin: 0, color: "#b7c2dd", fontSize: 16, lineHeight: 1.7 }}>{latest.intro}</p>
        </Link>
      ) : (
        <p className={styles.lead}>The first recap will appear after the next trading day closes.</p>
      )}
      {older.length > 0 && (
        <>
          <h2 className={styles.groupTitle}>Earlier recaps</h2>
          <ul className={styles.cards}>
            {older.map((recap) => (
              <li key={recap.slug}>
                <Link href={`/learn/market-today/${recap.publishedOn}`}><strong>{recap.title.replace("Stock Market Today: ", "")}</strong><span>{recap.description}</span></Link>
              </li>
            ))}
          </ul>
        </>
      )}
      <SignupCta title="Want this for your own stocks?" body="Get a free daily brief on the stocks you pick, every trading day at 5 PM ET." />
      <p className={styles.note}>Educational information, not financial advice.</p>
    </LearnShell>
  );
}
