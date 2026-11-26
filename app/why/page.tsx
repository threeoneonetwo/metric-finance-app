// The hub for "why did this stock move" pages: the newest explainers, grouped by trading day.
import type { Metadata } from "next";
import Link from "next/link";
import { listRecentWhyPages } from "@/db/why";
import { LearnShell, SignupCta } from "@/components/learn-shell";
import { whyHref } from "@/components/why-card";
import { longDate, percentText } from "@/lib/why";
import styles from "@/app/learn/learn.module.css";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Why Did These Stocks Move Today? Explained Like You're 5 | Metric Finance",
  description: "After every trading day we explain the biggest stock moves in plain words: what happened at the close, why it matters and what it doesn't prove.",
  alternates: { canonical: "/why" },
};

export default async function WhyHub() {
  const pages = await listRecentWhyPages(300);
  // Group by trading day, newest first, biggest moves first within a day.
  const days = new Map<string, typeof pages>();
  for (const page of pages) days.set(page.sessionDate, [...(days.get(page.sessionDate) ?? []), page]);
  const grouped = [...days.entries()].slice(0, 10).map(([date, items]) => [date, [...items].sort((a, b) => Math.abs(b.explainer.changePercent ?? 0) - Math.abs(a.explainer.changePercent ?? 0))] as const);

  return (
    <LearnShell crumbs={[{ name: "Why stocks moved", href: "/why" }]}>
      <div className={styles.hero}>
        <span className={styles.eyebrow}>After every close</span>
        <h1 className={styles.h1}>Why did these stocks move?</h1>
        <p className={styles.lead}>The biggest moves of each trading day, explained in plain words: what happened, why it matters, and what it doesn&apos;t prove.</p>
      </div>

      {grouped.length === 0 && <p className={styles.lead}>The first explainers arrive after the next market close. Search any stock on the <Link href="/">homepage</Link> to make one now.</p>}

      {grouped.map(([date, items]) => (
        <section key={date}>
          <h2 className={styles.groupTitle}>{longDate(date)}</h2>
          <ul className={styles.cards}>
            {items.map((item) => (
              <li key={item.symbol}>
                <Link href={whyHref(item.explainer)}>
                  <strong>{item.symbol} · {percentText(item.explainer.changePercent)}</strong>
                  <span>{item.explainer.headline}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}

      <SignupCta title="Get your own stocks explained every day" body="Pick up to five stocks and we post a free brief at 5 PM ET on what moved and why." />
    </LearnShell>
  );
}
