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

export function BriefingHistory({ briefings, linkQuery, showPast = true }: BriefingHistoryProps & { showPast?: boolean }) {
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
      {showPast && briefings.length > 1 ? (
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

// "Week of Nov 23": briefs are grouped by the Sunday that starts their week, in New York time.
function weekLabel(sentAt: string) {
  const day = new Date(new Date(sentAt).toLocaleString("en-US", { timeZone: "America/New_York" }));
  day.setDate(day.getDate() - day.getDay());
  return `Week of ${new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(day)}`;
}

const DAY_FORMAT = new Intl.DateTimeFormat("en-US", { weekday: "short", timeZone: "America/New_York" });

/** Every brief except the latest, grouped by week, for the dashboard's side column. */
export function PastBriefs({ briefings, linkQuery }: { briefings: BriefingSummary[]; linkQuery: string }) {
  const older = briefings.slice(1);
  if (older.length === 0) return null;
  const weeks: Array<{ label: string; items: BriefingSummary[] }> = [];
  for (const briefing of older) {
    const label = weekLabel(briefing.sentAt);
    const week = weeks[weeks.length - 1];
    if (week?.label === label) week.items.push(briefing);
    else weeks.push({ label, items: [briefing] });
  }
  return (
    <div className={styles.pastWeeks}>
      <h2 className={styles.briefingHeading}>Past briefs</h2>
      {weeks.map((week) => (
        <section key={week.label}>
          <h3>{week.label}</h3>
          <ul>
            {week.items.map((briefing) => (
              <li key={briefing.id}>
                <Link href={`/brief/${briefing.id}?${linkQuery}`}>
                  <span className={styles.pastWeekDay}>{DAY_FORMAT.format(new Date(briefing.sentAt))}</span>
                  <span className={styles.pastWeekTitle}>{briefing.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
