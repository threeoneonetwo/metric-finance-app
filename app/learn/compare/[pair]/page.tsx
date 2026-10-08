import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { StockLogo } from "@/components/stock-logo";
import { AsideCta, faqJsonLd, LearnShell, SignupCta, SITE } from "@/components/learn-shell";
import { comparePairs, driversFor, findStock, money, sizeLabel, summaryFor, type StockEntry } from "@/lib/learn/stocks";
import styles from "../../learn.module.css";

type Props = { params: Promise<{ pair: string }> };

export const dynamicParams = false;
export const generateStaticParams = () => comparePairs().map(([a, b]) => ({ pair: `${a.slug}-vs-${b.slug}` }));

function parse(pair: string): [StockEntry, StockEntry] | null {
  const [a, b] = pair.split("-vs-");
  const first = a ? findStock(a) : null;
  const second = b ? findStock(b) : null;
  return first && second && first.slug !== second.slug ? [first, second] : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const found = parse((await params).pair);
  if (!found) return {};
  const [a, b] = found;
  const title = `${a.stock.symbol} vs ${b.stock.symbol}: ${a.name} and ${b.name} Compared | Metric Finance`;
  const description = `${a.name} vs ${b.name} in simple words. See how the two companies and their stocks compare on size, sector and what drives each one.`;
  return {
    title,
    description,
    alternates: { canonical: `/learn/compare/${a.slug}-vs-${b.slug}` },
    openGraph: { title, description, url: `${SITE}/learn/compare/${a.slug}-vs-${b.slug}`, type: "article", siteName: "Metric Finance" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function ComparePage({ params }: Props) {
  const found = parse((await params).pair);
  if (!found) notFound();
  const [a, b] = found;
  const label = (entry: StockEntry) => sizeLabel(entry.profile?.cap) ?? "Not listed";
  const cell = (entry: StockEntry) => money(entry.profile?.cap) ?? "Not listed";
  const bigger = (a.profile?.cap ?? 0) >= (b.profile?.cap ?? 0) ? a : b;
  const sameIndustry = a.profile?.industry && a.profile.industry === b.profile?.industry;

  const faqs = [
    { q: `What is the difference between ${a.stock.symbol} and ${b.stock.symbol}?`, a: `${summaryFor(a)} ${summaryFor(b)}` },
    { q: `Which is bigger, ${a.name} or ${b.name}?`, a: `${bigger.name} has the larger market value, at about ${cell(bigger)}.` },
    { q: `Are ${a.name} and ${b.name} in the same industry?`, a: sameIndustry ? `Yes. Both are in the ${a.profile?.industry?.toLowerCase()} industry.` : `${a.name} is in ${a.profile?.industry ?? "its own industry"}, while ${b.name} is in ${b.profile?.industry ?? "its own industry"}.` },
  ];
  const rows: [string, string, string][] = [
    ["Ticker", a.stock.symbol, b.stock.symbol],
    ["Exchange", a.stock.exchange, b.stock.exchange],
    ["Sector", a.profile?.sector ?? "Not listed", b.profile?.sector ?? "Not listed"],
    ["Industry", a.profile?.industry ?? "Not listed", b.profile?.industry ?? "Not listed"],
    ["Size", label(a), label(b)],
    ["Market value", cell(a), cell(b)],
  ];
  const slug = `${a.slug}-vs-${b.slug}`;

  return (
    <LearnShell
      crumbs={[{ name: "Learn", href: "/learn" }, { name: `${a.stock.symbol} vs ${b.stock.symbol}`, href: `/learn/compare/${slug}` }]}
      jsonLd={[faqJsonLd(faqs)]}
      progress
    >
      <span className={styles.eyebrow}>Compare</span>
      <div className={styles.versus}><StockLogo symbol={a.stock.symbol} large /><em>vs</em><StockLogo symbol={b.stock.symbol} large /></div>
      <h1 className={styles.h1}>{a.name} vs {b.name}: <span className={styles.accent}>how do the stocks compare?</span></h1>
      <p className={styles.lead}>
        {a.stock.symbol} and {b.stock.symbol} side by side, in simple words. This is an explanation of the two businesses, not a recommendation to buy either one.
      </p>
      <div className={styles.layout}>
        <div>
      <table className={styles.compare}>
        <thead><tr><th></th><th>{a.stock.symbol}</th><th>{b.stock.symbol}</th></tr></thead>
        <tbody>{rows.map(([name, x, y]) => <tr key={name}><td>{name}</td><td>{x}</td><td>{y}</td></tr>)}</tbody>
      </table>
      {[a, b].map((entry) => (
        <section className={styles.card} key={entry.slug}>
          <h2>{entry.name} ({entry.stock.symbol})</h2>
          <p style={{ margin: "0 0 12px", color: "#b7c2dd", fontSize: 16, lineHeight: 1.7 }}>{summaryFor(entry)}</p>
          <ul>{driversFor(entry).moves.map((item) => <li key={item}>{item}</li>)}</ul>
          <p className={styles.related}><Link href={`/learn/stocks/${entry.slug}`}>Read the full {entry.stock.symbol} guide</Link></p>
        </section>
      ))}
      <div className={styles.ctaInline}>
        <SignupCta title={`Follow ${a.stock.symbol} and ${b.stock.symbol} every day`} body="Add both to your watchlist and read a free brief in simple words every trading day at 5 PM ET." />
      </div>
      <section className={styles.faq}>
        <h2 className={styles.groupTitle}>Common questions</h2>
        {faqs.map((faq) => <details key={faq.q}><summary>{faq.q}</summary><p>{faq.a}</p></details>)}
      </section>
        </div>
        <aside className={styles.aside}>
          <AsideCta title={`Follow ${a.stock.symbol} and ${b.stock.symbol}`} body="Add both to your watchlist for a free brief every trading day at 5 PM ET." />
          <div className={styles.asideCard}>
            <h3>Full guides</h3>
            <ul className={styles.toc}>
              <li><Link href={`/learn/stocks/${a.slug}`}>{a.name} ({a.stock.symbol})</Link></li>
              <li><Link href={`/learn/stocks/${b.slug}`}>{b.name} ({b.stock.symbol})</Link></li>
            </ul>
          </div>
        </aside>
      </div>
      <p className={styles.note}>Educational information, not financial advice. Figures are approximate and do not include live prices.</p>
    </LearnShell>
  );
}
