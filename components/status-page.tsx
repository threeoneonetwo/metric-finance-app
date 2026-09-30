import Link from "next/link";
import type { ReactNode } from "react";
import { AlertTriangle, Check, Mail } from "lucide-react";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";
import styles from "./status-page.module.css";

const ICONS = { success: Check, info: Mail, error: AlertTriangle } as const;

export function StatusPage({
  tone,
  title,
  children,
  actions,
}: {
  tone: keyof typeof ICONS;
  title: string;
  children: ReactNode;
  actions: ReactNode;
}) {
  const Icon = ICONS[tone];
  return (
    <main>
      <div className={styles.page}>
        <SiteHeader />
        <section className={styles.section}>
          <div className={styles.card}>
            <span className={`${styles.icon} ${tone === "info" ? "" : styles[tone]}`}>
              <Icon size={28} aria-hidden="true" />
            </span>
            <h1>{title}</h1>
            <p>{children}</p>
            <div className={styles.actions}>{actions}</div>
          </div>
        </section>
        <SiteFooter />
      </div>
    </main>
  );
}

export function StatusLink({ href, children, secondary }: { href: string; children: ReactNode; secondary?: boolean }) {
  return (
    <Link href={href} className={secondary ? styles.secondary : styles.primary}>
      {children}
    </Link>
  );
}

export function StatusSubmit({ children }: { children: ReactNode }) {
  return (
    <button type="submit" className={styles.primary}>
      {children}
    </button>
  );
}
