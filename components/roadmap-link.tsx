import Link from "next/link";
import styles from "./roadmap.module.css";

type Creds = { token: string; exp: string; sig: string };

// Sends a signed in reader to the product roadmap. The signed link travels with them so voting works on any device.
export function RoadmapLink({ creds, from }: { creds: Creds; from: "brief" | "dashboard" }) {
  return (
    <Link className={styles.cta} href={`/roadmap?${new URLSearchParams({ ...creds, from })}`}>
      <span className={styles.ctaText}>
        <strong>What should we build next?</strong>
        <span>Tell us what you&apos;d like us to build. You get three votes, and you can suggest your own ideas too.</span>
      </span>
      <span className={styles.ctaButton}>Vote now →</span>
    </Link>
  );
}
