import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { listBriefingsForSubscriber } from "@/db/briefings";
import { isInternalEmail, trackServer } from "@/lib/analytics-server";
import { resolveSubscriber } from "@/lib/session-server";
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
  searchParams: Promise<{ token?: string; exp?: string; sig?: string; welcome?: string; signin?: string }>;
};

export default async function ManagePage({ searchParams }: ManagePageProps) {
  const { token, exp, sig, welcome, signin } = await searchParams;
  const { subscriber, creds, staleSession } = await resolveSubscriber({ token, exp, sig });
  if (staleSession) redirect("/api/session/clear?to=/manage");

  if (!subscriber) {
    return (
      <main>
        <div className={styles.page}>
          <SiteHeader />
          <section className={styles.manageSection}>
            <div className={styles.manageInner}>
              <h1 className={styles.manageHeading}>
                {token ? "That link has expired" : signin ? "Sign in to Metric Finance" : "Manage your watchlist or unsubscribe"}
              </h1>
              <p className={styles.manageSub}>
                {token
                  ? "For your security, account links expire after 30 days. Enter your email and we'll send you a fresh one."
                  : signin
                    ? "Enter the email you signed up with and we'll email you a private link that signs you in. It works for 30 days."
                    : "Enter the email you signed up with and we'll send you a private link to change your stocks or unsubscribe."}
              </p>
              <RequestManageLink />
              <Link className={styles.manageBack} href="/">Back to Metric Finance</Link>
            </div>
          </section>
          <SiteFooter />
        </div>
      </main>
    );
  }

  const briefings = await listBriefingsForSubscriber(subscriber.id);
  await trackServer({
    event: "dashboard_viewed",
    distinctId: subscriber.id,
    properties: { internal: isInternalEmail(subscriber.email), just_confirmed: welcome === "1", briefs_count: briefings.length },
  });

  return (
    <main>
      <ManageWatchlist
        token={subscriber.unsubscribeToken}
        exp={creds!.exp}
        sig={creds!.sig}
        email={subscriber.email}
        justConfirmed={welcome === "1"}
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
