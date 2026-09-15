import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import styles from "@/components/newsletter-landing.module.css";

export const metadata: Metadata = {
  title: "You're confirmed | Metric Finance",
  robots: { index: false, follow: false },
};

type WelcomePageProps = {
  searchParams: Promise<{ email?: string; token?: string }>;
};

export default async function WelcomePage({ searchParams }: WelcomePageProps) {
  const { email, token } = await searchParams;

  return (
    <main>
      <div className={styles.page}>
        <SiteHeader />
        <section className={styles.manageSection}>
          <div className={styles.manageInner}>
            <h1 className={styles.manageHeading}>You&apos;re confirmed</h1>
            <p className={styles.manageSub}>
              {email ? <><strong>{email}</strong> is</> : "You're"} set up to receive the daily Metric
              Finance briefing on your watchlist.
            </p>
            {token && (
              <Link className={styles.manageUnsubscribe} href={`/manage?token=${token}`}>
                Manage your watchlist
              </Link>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
