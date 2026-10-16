import Link from "next/link";
import { ArrowRight } from "lucide-react";
import styles from "./newsletter-landing.module.css";

export type BriefingSummary = {
  id: string;
  tickers: string[];
  // A short headline written for the brief, shown instead of a summary so the reader has a reason to open it.
  title: string;
  sentAt: string;
};

type BriefingHistoryProps = {
  // Newest first: the first one gets the headline card, the rest are listed under Past briefs.
  briefings: BriefingSummary[];
  watchlistTickers?: string[];
  // Signed dashboard credentials, reused so each brief opens without asking again.
  linkQuery: string;
};

const DATE_FORMAT = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "America/New_York" });

export function BriefingHistory({ briefings, linkQuery }: BriefingHistoryProps) {
  const latest = briefings[0];

  if (!latest) {
    return (
      <div className={styles.briefingHistory}>
        <h2 className={styles.briefingHeading}>Your brief</h2>
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
      <h2 className={styles.briefingHeading}>Your brief</h2>
      <Link href={`/brief/${latest.id}?${linkQuery}`} className={styles.todaysBriefCard}>
        <div>
          <span className={styles.todaysBriefLabel}>Latest brief · {DATE_FORMAT.format(new Date(latest.sentAt))}</span>
          <span className={styles.todaysBriefHeadline}>{latest.title}</span>
        </div>
        <ArrowRight size={18} />
      </Link>
      {briefings.length > 1 ? (
        <>
          <h3 className={styles.pastBriefsHeading}>Past briefs</h3>
          <ul className={styles.pastBriefs}>
            {briefings.slice(1).map((briefing) => (
              <li key={briefing.id}>
                <Link href={`/brief/${briefing.id}?${linkQuery}`}>
                  <span className={styles.pastBriefDate}>{DATE_FORMAT.format(new Date(briefing.sentAt))}</span>
                  <span className={styles.pastBriefTitle}>{briefing.title}</span>
                  <ArrowRight size={15} />
                </Link>
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </div>
  );
}
