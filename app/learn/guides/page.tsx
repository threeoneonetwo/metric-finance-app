import type { Metadata } from "next";
import Link from "next/link";
import { LearnShell, SignupCta } from "@/components/learn-shell";
import { listLearnArticles } from "@/db/learn";
import { GUIDES } from "@/lib/learn/guides";
import styles from "../learn.module.css";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Beginner Stock Market Guides in Plain English | Metric Finance",
  description: "Free beginner guides to the stock market, from how stocks work and how to read a quote to earnings, interest rates and ETFs, explained like you're 5.",
  alternates: { canonical: "/learn/guides" },
};

export default async function GuidesIndex() {
  const stored = await listLearnArticles("guide", 200);
  const all = [
    ...stored.map((guide) => ({ slug: guide.slug, title: guide.title, description: guide.description })),
    ...GUIDES.map((guide) => ({ slug: guide.slug, title: guide.title, description: guide.description })),
  ];
  return (
    <LearnShell crumbs={[{ name: "Learn", href: "/learn" }, { name: "Guides", href: "/learn/guides" }]}>
      <span className={styles.eyebrow}>Guides</span>
      <h1 className={styles.h1}>Beginner stock market <span className={styles.accent}>guides</span></h1>
      <p className={styles.lead}>New guides are added regularly. Each one explains a single idea in plain English.</p>
      <ul className={styles.cards}>
        {all.map((guide) => (
          <li key={guide.slug}>
            <Link href={`/learn/guides/${guide.slug}`}><strong>{guide.title.split(":")[0]}</strong><span>{guide.description}</span></Link>
          </li>
        ))}
      </ul>
      <SignupCta title="Learn by following your own stocks" body="Get a free daily brief on up to five stocks, every trading day at 5 PM ET." />
      <p className={styles.note}>Educational information, not financial advice.</p>
    </LearnShell>
  );
}
