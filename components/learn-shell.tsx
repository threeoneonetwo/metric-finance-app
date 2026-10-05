import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { ReadingProgress, SpotlightLayer } from "@/components/learn-motion";
import styles from "@/app/learn/learn.module.css";

export const SITE = "https://metricfinance.app";

export type Crumb = { name: string; href: string };

// Shared frame for every Learn page: header, breadcrumbs, structured data and footer.
export function LearnShell({ crumbs, jsonLd, progress = false, children }: { crumbs: Crumb[]; jsonLd?: object[]; progress?: boolean; children: React.ReactNode }) {
  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [{ name: "Metric Finance", href: "/" }, ...crumbs].map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: `${SITE}${crumb.href}`,
    })),
  };
  return (
    <main>
      <div className={styles.page}>
        {progress && <ReadingProgress />}
        <SiteHeader />
        <SpotlightLayer>
          {crumbs.length > 1 && <p className={styles.crumbs}>
            {crumbs.map((crumb, index) => (
              <span key={crumb.href}>
                {index > 0 ? " / " : ""}
                {index < crumbs.length - 1 ? <Link href={crumb.href}>{crumb.name}</Link> : crumb.name}
              </span>
            ))}
          </p>}
          {children}
        </SpotlightLayer>
        <SiteFooter />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([breadcrumbs, ...(jsonLd ?? [])]) }} />
      </div>
    </main>
  );
}

export function faqJsonLd(faqs: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(({ q, a }) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
  };
}

export function SignupCta({ title, body }: { title: string; body: string }) {
  return (
    <div className={styles.cta}>
      <h2>{title}</h2>
      <p>{body}</p>
      <Link className={styles.button} href="/#signup">Start my free brief</Link>
    </div>
  );
}

export function AsideCta({ title, body }: { title: string; body: string }) {
  return (
    <div className={styles.asideCta}>
      <h3>{title}</h3>
      <p>{body}</p>
      <Link className={styles.button} href="/#signup">Start my free brief</Link>
    </div>
  );
}

export const headingId = (heading: string) => heading.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export function Toc({ headings }: { headings: string[] }) {
  return (
    <div className={styles.asideCard}>
      <h3>On this page</h3>
      <ul className={styles.toc}>
        {headings.map((heading) => <li key={heading}><a href={`#${headingId(heading)}`}>{heading}</a></li>)}
      </ul>
    </div>
  );
}

export function readingMinutes(texts: string[]) {
  const words = texts.join(" ").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}
