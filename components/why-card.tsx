// The explainer card: what a stock did at a close and why. Used by the homepage search, the Learn stock pages and the
// /why pages, so they always look the same. No state, so it works in both server and client components.
import Link from "next/link";
import { StockLogo } from "./stock-logo";
import styles from "./instant-explainer.module.css";
import type { InstantExplainer } from "@/lib/instant/explain";
import { whyHref } from "@/lib/why";

const percent = (value: number | null) => (value === null ? null : `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`);

export { whyHref };

export function WhyCard({ explainer, title = "h3", shareLink = false }: { explainer: InstantExplainer; title?: "h1" | "h2" | "h3"; shareLink?: boolean }) {
  const change = percent(explainer.changePercent);
  const market = percent(explainer.marketChangePercent);
  const Title = title;
  return (
    <article className={styles.card}>
      <header className={styles.cardHead}>
        <StockLogo symbol={explainer.symbol} />
        <div className={styles.cardTitle}>
          <strong>{explainer.symbol}</strong>
          <span>{explainer.company}</span>
        </div>
        <div className={styles.move}>
          <strong>${explainer.close.toFixed(2)}</strong>
          {change && <span className={(explainer.changePercent ?? 0) >= 0 ? styles.up : styles.down}>{change}</span>}
        </div>
      </header>
      <Title className={styles.headline}>{explainer.headline}</Title>
      <p className={styles.oneLiner}>{explainer.oneLiner}</p>
      <dl className={styles.parts}>
        <div><dt>What happened</dt><dd>{explainer.whatHappened}</dd></div>
        <div><dt>Why it matters</dt><dd>{explainer.whyItMatters}</dd></div>
        <div><dt>What it doesn&apos;t prove</dt><dd>{explainer.whatItDoesntProve}</dd></div>
      </dl>
      <div className={styles.idea}>
        <span>Idea of the day</span>
        <strong>{explainer.idea.term}</strong>
        <p>{explainer.idea.explanation}</p>
      </div>
      <p className={styles.footnote}>
        Based on the close on {explainer.sessionLabel}.{market ? ` The S&P 500 moved ${market} that day.` : ""} Educational, not financial advice.
        {shareLink && explainer.sessionDate && <> <Link href={whyHref(explainer)} className={styles.shareLink}>Open and share this explainer</Link></>}
      </p>
    </article>
  );
}
