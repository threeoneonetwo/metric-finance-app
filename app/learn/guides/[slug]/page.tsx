import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { StoredArticlePage } from "@/components/learn-article";
import { AsideCta, headingId, LearnShell, readingMinutes, SignupCta, SITE, Toc } from "@/components/learn-shell";
import { getLearnArticle } from "@/db/learn";
import { findGuide, GUIDES } from "@/lib/learn/guides";
import { findTerm } from "@/lib/learn/terms";
import styles from "../../learn.module.css";

type Props = { params: Promise<{ slug: string }> };

export const revalidate = 3600;
export const generateStaticParams = () => GUIDES.map((guide) => ({ slug: guide.slug }));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = (await params).slug;
  const guide = findGuide(slug);
  if (!guide) {
    const stored = await getLearnArticle(slug);
    if (!stored || stored.kind !== "guide") return {};
    return {
      title: `${stored.title} | Metric Finance`,
      description: stored.description,
      alternates: { canonical: `/learn/guides/${slug}` },
      openGraph: { title: stored.title, description: stored.description, url: `${SITE}/learn/guides/${slug}`, type: "article" },
    };
  }
  return {
    title: `${guide.title} | Metric Finance`,
    description: guide.description,
    alternates: { canonical: `/learn/guides/${guide.slug}` },
    openGraph: { title: guide.title, description: guide.description, url: `${SITE}/learn/guides/${guide.slug}`, type: "article" },
  };
}

export default async function GuidePage({ params }: Props) {
  const slug = (await params).slug;
  const guide = findGuide(slug);
  if (!guide) {
    const stored = await getLearnArticle(slug);
    if (!stored || stored.kind !== "guide") notFound();
    return <StoredArticlePage article={stored} base={{ name: "Guides", href: "/learn/guides" }} />;
  }
  const terms = guide.terms.flatMap((slug) => findTerm(slug) ?? []);
  const others = GUIDES.filter((item) => item.slug !== guide.slug).slice(0, 3);
  const article = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: guide.title,
    description: guide.description,
    author: { "@type": "Organization", name: "Metric Finance" },
    publisher: { "@type": "Organization", name: "Metric Finance" },
    mainEntityOfPage: `${SITE}/learn/guides/${guide.slug}`,
  };
  return (
    <LearnShell
      crumbs={[{ name: "Learn", href: "/learn" }, { name: guide.title.split(":")[0], href: `/learn/guides/${guide.slug}` }]}
      jsonLd={[article]}
      progress
    >
      <span className={styles.eyebrow}>Guide</span>
      <h1 className={styles.h1}>{guide.title}</h1>
      <p className={styles.lead}>{guide.intro}</p>
      <p className={styles.meta}><span>{readingMinutes([guide.intro, ...guide.sections.flatMap((section) => section.paragraphs)])} min read</span></p>
      <div className={styles.layout}>
        <div>
          <article className={styles.prose}>
            {guide.sections.map((section) => (
              <section key={section.heading}>
                <h2 id={headingId(section.heading)}>{section.heading}</h2>
                {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              </section>
            ))}
          </article>
          <div className={styles.ctaInline}>
            <SignupCta title="Get your stocks explained every day" body="Pick up to five stocks and read a free brief every trading day at 5 PM ET." />
          </div>
        </div>
        <aside className={styles.aside}>
          <Toc headings={guide.sections.map((section) => section.heading)} />
          <AsideCta title="Your stocks, explained daily" body="Free brief on up to five stocks, every trading day at 5 PM ET." />
        </aside>
      </div>
      {terms.length > 0 && (
        <section>
          <h2 className={styles.groupTitle}>Terms in this guide</h2>
          <ul className={styles.chips}>
            {terms.map((term) => <li key={term.slug}><Link href={`/learn/terms/${term.slug}`}>{term.term}</Link></li>)}
          </ul>
        </section>
      )}
      <h2 className={styles.groupTitle}>Keep learning</h2>
      <ul className={styles.cards}>
        {others.map((item) => (
          <li key={item.slug}><Link href={`/learn/guides/${item.slug}`}><strong>{item.title.split(":")[0]}</strong><span>{item.description}</span></Link></li>
        ))}
      </ul>
      <p className={styles.note}>Educational information, not financial advice.</p>
    </LearnShell>
  );
}
