import type { Metadata } from "next";
import Link from "next/link";
import { CountUp } from "@/components/learn-motion";
import { LearnShell, SignupCta } from "@/components/learn-shell";
import { TERMS } from "@/lib/learn/terms";
import styles from "../learn.module.css";

export const metadata: Metadata = {
  title: "Stock Market Glossary: Investing Terms Explained Like You're 5 | Metric Finance",
  description: "A plain English glossary of stock market and investing terms, from P/E ratio and market cap to dividends, ETFs and bull markets.",
  alternates: { canonical: "/learn/terms" },
};

export default function TermsPage() {
  const sorted = [...TERMS].sort((a, b) => a.term.localeCompare(b.term));
  const letters = [...new Set(sorted.map((term) => term.term[0].toUpperCase()))];
  return (
    <LearnShell crumbs={[{ name: "Learn", href: "/learn" }, { name: "Glossary", href: "/learn/terms" }]}>
      <div className={styles.hero}>
        <span className={styles.eyebrow}>Glossary</span>
        <h1 className={styles.h1}>Stock market terms <span className={styles.accent}>explained like you&apos;re 5</span></h1>
        <p className={styles.lead}>Short, simple definitions of the words you will see in financial news.</p>
      </div>
      <ul className={styles.stats} style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}>
        <li><strong><CountUp value={sorted.length} /></strong><span>terms</span></li>
        <li><strong>A to Z</strong><span>easy to browse</span></li>
        <li><strong>Plain</strong><span>English only</span></li>
      </ul>
      <nav className={styles.alphabet} aria-label="Jump to letter">
        {letters.map((letter) => <a key={letter} href={`#letter-${letter}`}>{letter}</a>)}
      </nav>
      {letters.map((letter) => (
        <section key={letter}>
          <h2 className={styles.letter} id={`letter-${letter}`}>{letter}</h2>
          <ul className={styles.cards}>
            {sorted.filter((term) => term.term[0].toUpperCase() === letter).map((term) => (
              <li key={term.slug}>
                <Link href={`/learn/terms/${term.slug}`}>
                  <strong>{term.term}</strong>
                  <span>{term.simple}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
      <SignupCta title="See these words in action" body="Get a free daily brief on your own stocks, explained in plain English." />
    </LearnShell>
  );
}
