import Link from "next/link";
import { LearnShell, SignupCta, SITE } from "@/components/learn-shell";
import type { LearnSection } from "@/db/schema";
import { findTerm } from "@/lib/learn/terms";
import styles from "@/app/learn/learn.module.css";

export type StoredArticle = {
  slug: string;
  kind: string;
  title: string;
  description: string;
  intro: string;
  sections: LearnSection[];
  extra: { movers?: { symbol: string; changePercent: number }[]; terms?: string[] } | null;
  publishedOn: string;
};

const sign = (value: number) => `${value > 0 ? "+" : ""}${value.toFixed(2)}%`;

// Renders an article that the daily Learn job wrote (a market recap or a guide).
export function StoredArticlePage({ article, base }: { article: StoredArticle; base: { name: string; href: string } }) {
  const url = `${SITE}${base.href}/${article.slug.replace(/^market-today-/, "")}`;
  const terms = (article.extra?.terms ?? []).flatMap((slug) => findTerm(slug) ?? []);
  const movers = article.extra?.movers ?? [];
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    datePublished: article.publishedOn,
    dateModified: article.publishedOn,
    author: { "@type": "Organization", name: "Metric Finance" },
    publisher: { "@type": "Organization", name: "Metric Finance" },
    mainEntityOfPage: url,
  };
  const published = new Date(`${article.publishedOn}T12:00:00Z`).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });
  return (
    <LearnShell
      crumbs={[{ name: "Learn", href: "/learn" }, base, { name: article.title.split(":").pop()!.trim(), href: `${base.href}/${article.slug.replace(/^market-today-/, "")}` }]}
      jsonLd={[schema]}
    >
      <span className={styles.eyebrow}>{article.kind === "market-today" ? "Market recap" : "Guide"} · {published}</span>
      <h1 className={styles.h1}>{article.title}</h1>
      <p className={styles.lead}>{article.intro}</p>
      {movers.length > 0 && (
        <ul className={styles.chips}>
          {movers.map((move) => (
            <li key={move.symbol}><Link href={`/learn/stocks/${move.symbol.toLowerCase().replace(/\./g, "-")}`}>{move.symbol} {sign(move.changePercent)}</Link></li>
          ))}
        </ul>
      )}
      <article className={styles.prose}>
        {article.sections.map((section) => (
          <section key={section.heading}>
            <h2>{section.heading}</h2>
            {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </section>
        ))}
      </article>
      <SignupCta title="Get your stocks explained every day" body="Pick up to five stocks and read a free brief every trading day at 5 PM ET." />
      {terms.length > 0 && (
        <section>
          <h2 className={styles.groupTitle}>Terms in this article</h2>
          <ul className={styles.chips}>
            {terms.map((term) => <li key={term.slug}><Link href={`/learn/terms/${term.slug}`}>{term.term}</Link></li>)}
          </ul>
        </section>
      )}
      <p className={styles.note}>Educational information, not financial advice. Market moves are approximate and may be delayed.</p>
    </LearnShell>
  );
}
