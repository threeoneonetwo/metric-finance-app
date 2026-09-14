"use client";

import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import styles from "./newsletter-landing.module.css";

export type BriefingSummary = {
  id: string;
  tickers: string[];
  text: string;
  sentAt: string;
};

type BriefingHistoryProps = {
  briefings: BriefingSummary[];
};

const DATE_FORMAT = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" });

export function BriefingHistory({ briefings }: BriefingHistoryProps) {
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

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
    return (
      <div className={styles.briefingHistory}>
        <h2 className={styles.briefingHeading}>Your briefings</h2>
        <p className={styles.note}>Nothing sent yet — your first briefing will show up here once it goes out.</p>
      </div>
    );
  }

  return (
    <div className={styles.briefingHistory}>
      <h2 className={styles.briefingHeading}>Your briefings</h2>
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
