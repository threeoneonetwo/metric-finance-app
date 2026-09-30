"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import styles from "./newsletter-landing.module.css";

export type BriefingSummary = {
  id: string;
  tickers: string[];
  text: string;
  sentAt: string;
};

type BriefingHistoryProps = {
  briefings: BriefingSummary[];
  watchlistTickers?: string[];
  // Signed dashboard credentials, reused so each brief opens without asking again.
  linkQuery: string;
};

// The saved plain text starts "Metric Finance, <date>", then "TODAY IN ONE SENTENCE" and the sentence.
function headlineOf(text: string) {
  const lines = text.split("\n");
  const at = lines.findIndex((line) => line.startsWith("TODAY IN ONE SENTENCE"));
  const sentence = at >= 0 ? lines[at + 1] ?? "" : "";
  return sentence.length > 140 ? `${sentence.slice(0, 137)}...` : sentence;
}

const DATE_FORMAT = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" });

export function BriefingHistory({ briefings, linkQuery }: BriefingHistoryProps) {
  const [query, setQuery] = useState("");
  const hrefFor = (id: string) => `/brief/${id}?${linkQuery}`;
  const latest = briefings[0];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return briefings;
    return briefings.filter((briefing) => {
      const date = DATE_FORMAT.format(new Date(briefing.sentAt)).toLowerCase();
      return (
        date.includes(q) ||
        briefing.tickers.some((ticker) => ticker.toLowerCase().includes(q)) ||
        briefing.text.toLowerCase().includes(q)
      );
    });
  }, [briefings, query]);

  if (!latest) {
    return (
      <div className={styles.briefingHistory}>
        <h2 className={styles.briefingHeading}>Your briefs</h2>
        <Link href="/brief" className={styles.briefingLatestCard}>
          <span className={styles.todaysBriefLabel}>Coming at 5 PM ET</span>
          <span className={styles.todaysBriefHeadline}>Your first brief is on its way</span>
          <p>
            Every trading day at 5 PM ET your brief is posted here, and we email you a link when it&apos;s up.
            Until then, see what one looks like.
          </p>
          <span className={styles.briefingLatestCta}>Read a sample brief <ArrowRight size={15} /></span>
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.briefingHistory}>
      <h2 className={styles.briefingHeading}>Your briefs</h2>
      <Link href={hrefFor(latest.id)} className={styles.todaysBriefCard}>
        <div>
          <span className={styles.todaysBriefLabel}>Latest brief</span>
          <span className={styles.todaysBriefHeadline}>{headlineOf(latest.text) || DATE_FORMAT.format(new Date(latest.sentAt))}</span>
        </div>
        <ArrowRight size={18} />
      </Link>
      <input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search by ticker, date, or keyword"
        aria-label="Search your briefs"
        className={styles.briefingSearch}
      />

      {filtered.length === 0 ? (
        <p className={styles.note}>No briefs match &quot;{query}&quot;.</p>
      ) : (
        <div className={styles.briefingList}>
          {filtered.map((briefing) => (
            <div key={briefing.id} className={styles.briefingRow}>
              <Link href={hrefFor(briefing.id)} className={styles.briefingRowHead}>
                <span className={styles.briefingDate}>{DATE_FORMAT.format(new Date(briefing.sentAt))}</span>
                <span className={styles.briefingTickers}>
                  {briefing.tickers.map((ticker) => <span key={ticker}>{ticker}</span>)}
                </span>
                <ArrowRight size={16} />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
