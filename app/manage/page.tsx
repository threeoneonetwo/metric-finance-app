import type { Metadata } from "next";
import Link from "next/link";
import { listBriefingsForSubscriber } from "@/db/briefings";
import { findSubscriberByToken } from "@/db/subscribers";
import { isValidManageLink } from "@/lib/manage-link";
import { ManageWatchlist } from "@/components/manage-watchlist";
import { RequestManageLink } from "@/components/request-manage-link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import styles from "@/components/newsletter-landing.module.css";
import { stocksFromSymbols } from "@/lib/stocks";

export const metadata: Metadata = {
  title: "Manage your watchlist | Metric Finance",
  robots: { index: false, follow: false },
};

type ManagePageProps = {
  searchParams: Promise<{ token?: string; exp?: string; sig?: string }>;
};

export default async function ManagePage({ searchParams }: ManagePageProps) {
  const { token, exp, sig } = await searchParams;
  const subscriber = token && isValidManageLink(token, exp, sig) ? await findSubscriberByToken(token) : null;

  if (!subscriber) {
    return (
      <main>
        <div className={styles.page}>
          <SiteHeader />
          <section className={styles.manageSection}>
            <div className={styles.manageInner}>
              <h1 className={styles.manageHeading}>
                {token ? "That link has expired" : "Manage your watchlist or unsubscribe"}
              </h1>
              <p className={styles.manageSub}>
                {token
                  ? "For your security, account links expire after 30 days. Enter your email and we'll send you a fresh one."
                  : "Enter the email you signed up with and we'll send you a private link to change your stocks or unsubscribe."}
              </p>
              <RequestManageLink />
              <Link className={styles.manageUnsubscribe} href="/">Back to Metric Finance</Link>
            </div>
          </section>
          <SiteFooter />
        </div>
      </main>
    );
  }

  const briefings = await listBriefingsForSubscriber(subscriber.id);

  return (
    <main>
      <ManageWatchlist
        token={subscriber.unsubscribeToken}
        exp={exp!}
        sig={sig!}
        email={subscriber.email}
        initialPicks={stocksFromSymbols(subscriber.tickers)}
        briefings={briefings.map((briefing) => ({
          id: briefing.id,
          tickers: briefing.tickers,
          text: briefing.text,
          sentAt: briefing.sentAt.toISOString(),
        }))}
      />
    </main>
  );
}
