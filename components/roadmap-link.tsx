import Link from "next/link";
import styles from "./roadmap.module.css";

type Creds = { token: string; exp: string; sig: string };

function CardBody() {
  return (
    <>
      <span className={styles.ctaIcon} aria-hidden="true">
        <svg width="18" height="18" viewBox="0 0 18 18"><path d="M9 2v14M2 9h14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
      </span>
      <span className={styles.ctaText}>
        <strong>Got an idea to make your brief better?</strong>
        <span>Suggest it, or vote on what other readers want.</span>
      </span>
      <span className={styles.ctaAction}>
        <span>Suggest</span>
        <svg width="20" height="14" viewBox="0 0 20 14" aria-hidden="true"><path d="M1 7h17M12 1l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </span>
    </>
  );
}

// Sends a signed in reader to the product roadmap. The signed link travels with them so voting works on any device.
export function RoadmapLink({ creds, from }: { creds: Creds; from: "brief" | "dashboard" }) {
  return (
    <Link className={styles.cta} href={`/roadmap?${new URLSearchParams({ ...creds, from })}`}>
      <CardBody />
    </Link>
  );
}

// The same card on the public sample brief. Visitors have no roadmap yet, so it sends them to sign up.
export function RoadmapLinkDemo() {
  return (
    <Link className={styles.cta} href="/#signup">
      <CardBody />
    </Link>
  );
}
