import type { Metadata } from "next";
import Link from "next/link";
import { findSubscriberByToken } from "@/db/subscribers";
import { ManageWatchlist } from "@/components/manage-watchlist";
import styles from "@/components/newsletter-landing.module.css";
import { stocksFromSymbols } from "@/lib/stocks";

export const metadata: Metadata = {
  title: "Manage your watchlist | Metric Finance",
  robots: { index: false, follow: false },
};

type ManagePageProps = {
  searchParams: Promise<{ token?: string }>;
};

export default async function ManagePage({ searchParams }: ManagePageProps) {
  const { token } = await searchParams;
  const subscriber = token ? await findSubscriberByToken(token) : null;

  if (!subscriber) {
    return (
      <main>
        <div className={styles.page}>
          <header className={styles.header}>
            <Link href="/" className={styles.logo}>Metric Finance</Link>
          </header>
          <section className={styles.manageSection}>
            <div className={styles.manageInner}>
              <h1 className={styles.manageHeading}>We couldn&apos;t find that watchlist</h1>
              <p className={styles.manageSub}>
                The link may have expired or been copied incompletely. Open the most recent link from
                your briefing, or subscribe again to start a new watchlist.
              </p>
              <Link className={styles.manageUnsubscribe} href="/">Back to Metric Finance</Link>
            </div>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main>
      <ManageWatchlist
        token={subscriber.unsubscribeToken}
        email={subscriber.email}
        initialPicks={stocksFromSymbols(subscriber.tickers)}
      />
    </main>
  );
}
