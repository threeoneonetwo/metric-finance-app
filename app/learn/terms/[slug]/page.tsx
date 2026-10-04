import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { faqJsonLd, LearnShell, SignupCta, SITE } from "@/components/learn-shell";
import { findTerm, TERMS } from "@/lib/learn/terms";
import styles from "../../learn.module.css";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;
export const generateStaticParams = () => TERMS.map((term) => ({ slug: term.slug }));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const term = findTerm((await params).slug);
  if (!term) return {};
  const title = `What Is ${term.term}? Explained Like You're 5 | Metric Finance`;
  return {
    title,
    description: `${term.simple} ${term.explain.split(". ")[0]}.`.slice(0, 300),
    alternates: { canonical: `/learn/terms/${term.slug}` },
    openGraph: { title, url: `${SITE}/learn/terms/${term.slug}`, type: "article" },
  };
}

export default async function TermPage({ params }: Props) {
  const term = findTerm((await params).slug);
  if (!term) notFound();
  const related = term.related.flatMap((slug) => findTerm(slug) ?? []);
  const faqs = [
    { q: `What is ${term.term}?`, a: `${term.simple} ${term.explain}` },
    { q: `Why does ${term.term} matter?`, a: term.why },
  ];
  return (
    <LearnShell
      crumbs={[{ name: "Learn", href: "/learn" }, { name: "Glossary", href: "/learn/terms" }, { name: term.term, href: `/learn/terms/${term.slug}` }]}
      jsonLd={[faqJsonLd(faqs)]}
    >
      <span className={styles.eyebrow}>Glossary</span>
      <h1 className={styles.h1}>What is <span className={styles.accent}>{term.term}</span>?</h1>
      <p className={styles.lead}>{term.simple}</p>
      <section className={styles.card}>
        <h2>The simple explanation</h2>
        <p style={{ margin: 0, color: "#c4cee6", fontSize: 17, lineHeight: 1.75 }}>{term.explain}</p>
      </section>
      <section className={styles.card}>
        <h2>An example</h2>
        <p style={{ margin: 0, color: "#c4cee6", fontSize: 17, lineHeight: 1.75 }}>{term.example}</p>
      </section>
      <section className={styles.card}>
        <h2>Why it matters</h2>
        <p style={{ margin: 0, color: "#c4cee6", fontSize: 17, lineHeight: 1.75 }}>{term.why}</p>
      </section>
      <SignupCta title="See it in your own stocks" body="Get a free daily brief that explains your stocks like you're 5, every trading day at 5 PM ET." />
      {related.length > 0 && (
        <section>
          <h2 className={styles.groupTitle}>Related terms</h2>
          <ul className={styles.chips}>
            {related.map((item) => <li key={item.slug}><Link href={`/learn/terms/${item.slug}`}>{item.term}</Link></li>)}
          </ul>
        </section>
      )}
      <p className={styles.note}>Educational information, not financial advice.</p>
    </LearnShell>
  );
}
