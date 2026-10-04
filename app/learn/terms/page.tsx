import type { Metadata } from "next";
import Link from "next/link";
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
  return (
    <LearnShell crumbs={[{ name: "Learn", href: "/learn" }, { name: "Glossary", href: "/learn/terms" }]}>
      <span className={styles.eyebrow}>Glossary</span>
      <h1 className={styles.h1}>Stock market terms explained like you&apos;re 5</h1>
      <p className={styles.lead}>Short, simple definitions of the words you will see in financial news.</p>
      <ul className={styles.cards}>
        {sorted.map((term) => (
          <li key={term.slug}>
            <Link href={`/learn/terms/${term.slug}`}>
              <strong>{term.term}</strong>
              <span>{term.simple}</span>
            </Link>
          </li>
        ))}
      </ul>
      <SignupCta title="See these words in action" body="Get a free daily brief on your own stocks, explained in plain English." />
    </LearnShell>
  );
}
