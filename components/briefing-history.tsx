"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronDown } from "lucide-react";
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
  todaysBrief?: { href: string; headline: string };
};

const DATE_FORMAT = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" });
const SAMPLE_TICKERS = ["AAPL", "TSLA"];

export function BriefingHistory({ briefings, watchlistTickers = [], todaysBrief }: BriefingHistoryProps) {
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  const todaysBriefCard = todaysBrief && (
    <Link href={todaysBrief.href} className={styles.todaysBriefCard}>
      <div>
        <span className={styles.todaysBriefLabel}>Today&apos;s brief</span>
        <span className={styles.todaysBriefHeadline}>{todaysBrief.headline}</span>
      </div>
      <ArrowRight size={18} />
    </Link>
  );

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

  if (briefings.length === 0) {
    const previewTickers = watchlistTickers.length > 0 ? watchlistTickers.slice(0, 5) : SAMPLE_TICKERS;
    return (
      <div className={styles.briefingHistory}>
        <h2 className={styles.briefingHeading}>Your briefings</h2>
        {todaysBriefCard}
        <div className={styles.briefingEmpty}>
          <h3 className={styles.briefingEmptyTitle}>Nothing sent yet</h3>
          <p>Your first briefing will show up here once it goes out.</p>

          <p className={styles.briefingPreviewLabel}>What it&apos;ll look like</p>
          <div className={styles.briefingPreviewRow}>
            <span className={styles.briefingDate}>Today</span>
            <span className={styles.briefingTickers}>
              {previewTickers.map((ticker) => <span key={ticker}>{ticker}</span>)}
            </span>
            <ChevronDown size={16} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.briefingHistory}>
      <h2 className={styles.briefingHeading}>Your briefings</h2>
      {todaysBriefCard}
      <input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search by ticker, date, or keyword"
        aria-label="Search your briefings"
        className={styles.briefingSearch}
      />

      {filtered.length === 0 ? (
        <p className={styles.note}>No briefings match &quot;{query}&quot;.</p>
      ) : (
        <div className={styles.briefingList}>
          {filtered.map((briefing) => {
            const open = openId === briefing.id;
            return (
              <div key={briefing.id} className={styles.briefingRow}>
                <button
                  type="button"
                  className={styles.briefingRowHead}
                  onClick={() => setOpenId(open ? null : briefing.id)}
                  aria-expanded={open}
                >
                  <span className={styles.briefingDate}>{DATE_FORMAT.format(new Date(briefing.sentAt))}</span>
                  <span className={styles.briefingTickers}>
                    {briefing.tickers.map((ticker) => <span key={ticker}>{ticker}</span>)}
                  </span>
                  <ChevronDown size={16} className={open ? styles.briefingChevronOpen : ""} />
                </button>
                {open && <pre className={styles.briefingBody}>{briefing.text}</pre>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
