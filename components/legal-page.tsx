import type { ReactNode } from "react";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";
import styles from "./newsletter-landing.module.css";

type LegalPageProps = {
  title: string;
  updated: string;
  children: ReactNode;
};

export function LegalPage({ title, updated, children }: LegalPageProps) {
  return (
    <main>
      <div className={styles.page}>
        <SiteHeader />
        <section className={styles.manageSection}>
          <article className={`${styles.manageInner} ${styles.legal}`}>
            <h1 className={styles.manageHeading}>{title}</h1>
            <p className={styles.legalUpdated}>Last updated {updated}</p>
            {children}
          </article>
        </section>
        <SiteFooter />
      </div>
    </main>
  );
}
