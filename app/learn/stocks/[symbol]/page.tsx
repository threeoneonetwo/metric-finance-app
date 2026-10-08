import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getLearnStock } from "@/db/learn";
import { latestHeadlines } from "@/lib/learn/news";
import { StockLogo } from "@/components/stock-logo";
import { AsideCta, faqJsonLd, LearnShell, SignupCta, SITE } from "@/components/learn-shell";
import { TERMS } from "@/lib/learn/terms";
import { driversFor, findStock, indexableStocks, isIndexable, money, peersOf, sizeLabel, summaryFor, termsFor } from "@/lib/learn/stocks";
import styles from "../../learn.module.css";

type Props = { params: Promise<{ symbol: string }> };

// The daily Learn job rewrites stock pages; this lets the new text and fresh headlines appear within the hour.
export const revalidate = 3600;

// The best known stocks are built ahead of time. Every other US listed stock is built the first time it is visited.
export function generateStaticParams() {
  return indexableStocks().map((entry) => ({ symbol: entry.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const entry = findStock((await params).symbol);
  if (!entry) return {};
  const title = `${entry.name} (${entry.stock.symbol}) Stock Explained Like You're 5 | Metric Finance`;
  const description = `What ${entry.name} does, how it makes money and what moves ${entry.stock.symbol} stock, explained in simple words. Follow it in a free daily brief.`;
  return {
    title,
    description,
    alternates: { canonical: `/learn/stocks/${entry.slug}` },
    robots: isIndexable(entry) ? undefined : { index: false, follow: true },
    openGraph: { title, description, url: `${SITE}/learn/stocks/${entry.slug}`, type: "article", siteName: "Metric Finance" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function StockPage({ params }: Props) {
  const entry = findStock((await params).symbol);
  if (!entry) notFound();
  const { stock, name, profile } = entry;
  const [stored, headlines] = await Promise.all([
    getLearnStock(stock.symbol),
    latestHeadlines(`"${name}" OR ${stock.symbol} stock`, 5),
  ]);
  const written = stored?.content ?? null;
  const facts = stored?.facts ?? null;
  const drivers = written ? { makes: written.makesMoney, moves: written.movesStock } : driversFor(entry);
  const peers = peersOf(entry);
  const size = sizeLabel(profile?.cap);
  const cap = money(profile?.cap);
  const exchange = stock.exchange === "NYSE" ? "New York Stock Exchange" : "Nasdaq";
  const terms = termsFor(entry).flatMap((slug) => TERMS.find((term) => term.slug === slug) ?? []);
  const summary = written?.simple ?? summaryFor(entry);

  const baseFaqs = [
    { q: `What does ${name} do?`, a: summary },
    { q: `What is the ticker symbol for ${name}?`, a: `${name} trades under the ticker ${stock.symbol} on the ${exchange}.` },
    { q: `How does ${name} make money?`, a: drivers.makes.join(" ") },
    { q: `What moves ${stock.symbol} stock?`, a: drivers.moves.join(" ") },
  ];
  const faqs = [
    ...(written ? [...baseFaqs.slice(0, 1), ...written.faqs, ...baseFaqs.slice(1)] : baseFaqs),
    { q: `How can I follow ${stock.symbol} stock every day?`, a: `Add ${stock.symbol} to your watchlist on Metric Finance. We post a free brief every trading day at 5 PM ET that explains what happened to the stocks you follow, in simple words.` },
  ];

  return (
    <LearnShell
      crumbs={[{ name: "Learn", href: "/learn" }, { name: stock.symbol, href: `/learn/stocks/${entry.slug}` }]}
      jsonLd={[faqJsonLd(faqs)]}
      progress
    >
      <span className={styles.eyebrow}>{stock.exchange}: {stock.symbol}</span>
      <div className={styles.stockHead}>
        <StockLogo symbol={stock.symbol} large />
        <h1 className={styles.h1}>{name} ({stock.symbol}) stock, <span className={styles.accent}>explained like you&apos;re 5</span></h1>
      </div>
      <p className={styles.lead} style={{ marginTop: 18 }}>{summary}</p>

      <div className={styles.layout}>
        <div>
      <dl className={styles.facts}>
        <div><dt>Ticker</dt><dd>{stock.symbol}</dd></div>
        <div><dt>Exchange</dt><dd>{exchange}</dd></div>
        {profile?.sector ? <div><dt>Sector</dt><dd>{profile.sector}</dd></div> : null}
        {profile?.industry ? <div><dt>Industry</dt><dd>{profile.industry}</dd></div> : null}
        {size ? <div><dt>Size</dt><dd>{size[0].toUpperCase() + size.slice(1)}{cap ? `, about ${cap}` : ""}</dd></div> : null}
        {facts?.ceo ? <div><dt>Led by</dt><dd>{facts.ceo}</dd></div> : null}
        {facts?.headquarters ? <div><dt>Headquarters</dt><dd>{facts.headquarters}</dd></div> : null}
        {facts?.employees ? <div><dt>Employees</dt><dd>{facts.employees.toLocaleString("en-US")}</dd></div> : null}
        {facts?.listedSince ? <div><dt>Public since</dt><dd>{facts.listedSince}</dd></div> : null}
      </dl>

      <section className={styles.card}>
        <h2>How {name} makes money</h2>
        <ul>{drivers.makes.map((item) => <li key={item}>{item}</li>)}</ul>
      </section>
      <section className={styles.card}>
        <h2>What moves {stock.symbol} stock</h2>
        <ul>{drivers.moves.map((item) => <li key={item}>{item}</li>)}</ul>
      </section>

      {written && written.goodToKnow.length > 0 && (
        <section className={styles.card}>
          <h2>Good to know about {name}</h2>
          <ul>{written.goodToKnow.map((item) => <li key={item}>{item}</li>)}</ul>
        </section>
      )}

      {headlines.length > 0 && (
        <section className={styles.card}>
          <h2>In the news lately</h2>
          <ul>{headlines.map((headline) => <li key={headline.title}>{headline.title}{headline.source ? ` (${headline.source})` : ""}</li>)}</ul>
        </section>
      )}

      <div className={styles.ctaInline}>
        <SignupCta
          title={`Follow ${stock.symbol} in your daily brief`}
          body={`Each trading day at 5 PM ET we post what happened to ${name} and why it matters, in simple words. Free.`}
        />
      </div>

      <section className={styles.card}>
        <h2>Key terms to know before you follow {stock.symbol}</h2>
        <ul className={styles.chips}>
          {terms.map((term) => <li key={term.slug}><Link href={`/learn/terms/${term.slug}`}>{term.term}</Link></li>)}
        </ul>
      </section>

      <section className={styles.faq}>
        <h2 className={styles.groupTitle} style={{ marginTop: 34 }}>Questions about {name} stock</h2>
        {faqs.map((faq) => (
          <details key={faq.q}>
            <summary>{faq.q}</summary>
            <p>{faq.a}</p>
          </details>
        ))}
      </section>
        </div>
        <aside className={styles.aside}>
          <AsideCta title={`Follow ${stock.symbol} daily`} body={`A free brief on ${name} and your other stocks, every trading day at 5 PM ET.`} />
          {peers.length > 0 && (
            <div className={styles.asideCard}>
              <h3>Similar stocks</h3>
              <ul className={styles.toc}>
                {peers.map((peer) => <li key={peer.slug}><Link href={`/learn/stocks/${peer.slug}`}>{peer.stock.symbol} · {peer.name}</Link></li>)}
              </ul>
            </div>
          )}
        </aside>
      </div>

      {peers.length > 0 && (
        <section>
          <h2 className={styles.groupTitle}>Similar stocks</h2>
          <ul className={styles.grid}>
            {peers.map((peer) => (
              <li key={peer.slug}>
                <Link href={`/learn/stocks/${peer.slug}`}><strong>{peer.stock.symbol}</strong><span>{peer.name}</span></Link>
              </li>
            ))}
          </ul>
          <p className={styles.related}>
            Compare {stock.symbol}:{" "}
            {peers.slice(0, 3).map((peer, index) => {
              const [a, b] = [entry.slug, peer.slug].sort();
              return (
                <span key={peer.slug}>
                  {index > 0 ? ", " : ""}
                  <Link href={`/learn/compare/${a}-vs-${b}`}>{stock.symbol} vs {peer.stock.symbol}</Link>
                </span>
              );
            })}
          </p>
        </section>
      )}
      <p className={styles.note}>
        {stored ? `Updated ${stored.generatedAt.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "America/New_York" })}. ` : ""}
        Educational information, not financial advice. This guide explains the business in general terms and does not include live prices.
      </p>
    </LearnShell>
  );
}
