"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import styles from "./newsletter-landing.module.css";

type Stock = {
  symbol: string;
  name: string;
  exchange: "NASDAQ" | "NYSE";
};

const STOCKS: Stock[] = [
  { symbol: "AAPL", name: "Apple Inc.", exchange: "NASDAQ" },
  { symbol: "MSFT", name: "Microsoft Corporation", exchange: "NASDAQ" },
  { symbol: "NVDA", name: "NVIDIA Corporation", exchange: "NASDAQ" },
  { symbol: "AMZN", name: "Amazon.com, Inc.", exchange: "NASDAQ" },
  { symbol: "GOOGL", name: "Alphabet Inc.", exchange: "NASDAQ" },
  { symbol: "META", name: "Meta Platforms, Inc.", exchange: "NASDAQ" },
  { symbol: "TSLA", name: "Tesla, Inc.", exchange: "NASDAQ" },
  { symbol: "AVGO", name: "Broadcom Inc.", exchange: "NASDAQ" },
  { symbol: "NFLX", name: "Netflix, Inc.", exchange: "NASDAQ" },
  { symbol: "COST", name: "Costco Wholesale Corporation", exchange: "NASDAQ" },
  { symbol: "AMD", name: "Advanced Micro Devices, Inc.", exchange: "NASDAQ" },
  { symbol: "ADBE", name: "Adobe Inc.", exchange: "NASDAQ" },
  { symbol: "JPM", name: "JPMorgan Chase & Co.", exchange: "NYSE" },
  { symbol: "V", name: "Visa Inc.", exchange: "NYSE" },
  { symbol: "WMT", name: "Walmart Inc.", exchange: "NYSE" },
  { symbol: "XOM", name: "Exxon Mobil Corporation", exchange: "NYSE" },
  { symbol: "MA", name: "Mastercard Incorporated", exchange: "NYSE" },
  { symbol: "KO", name: "The Coca-Cola Company", exchange: "NYSE" },
  { symbol: "DIS", name: "The Walt Disney Company", exchange: "NYSE" },
  { symbol: "BRK.B", name: "Berkshire Hathaway Inc.", exchange: "NYSE" },
  { symbol: "PLTR", name: "Palantir Technologies Inc.", exchange: "NASDAQ" },
  { symbol: "COIN", name: "Coinbase Global, Inc.", exchange: "NASDAQ" },
];

const FEATURES = [
  ["01", "Price action", "What the stock did today—and the clearest explanation of why it moved."],
  ["02", "Fundamentals", "Revenue, margins, cash, and debt translated out of accounting language."],
  ["03", "Peer comparison", "How each company is performing against the businesses it actually competes with."],
  ["04", "News", "The headlines that matter to your holdings, with the rest of the noise removed."],
] as const;

const TESTIMONIALS = [
  {
    quote: "I had been holding Netflix for months without really knowing why. One Metric briefing helped me understand what I actually owned.",
    author: "Dana W.",
    role: "Product manager, Austin",
  },
  {
    quote: "I always found stock research intimidating. Metric broke it down so simply that I read the whole briefing in one sitting.",
    author: "Marcus B.",
    role: "Growth marketer, Chicago",
  },
  {
    quote: "I checked my JPMorgan position before adding more. The explanation was clear enough that I could make my own decision with confidence.",
    author: "Priya S.",
    role: "UX designer, Seattle",
  },
  {
    quote: "I used to spend an hour reading five different sites. Now I understand my whole watchlist from one briefing.",
    author: "Ethan C.",
    role: "Software engineer, Denver",
  },
];

const FAQS = [
  {
    question: "What does Metric's analysis cover?",
    answer: "Each briefing covers price action, fundamentals, peer comparison, and recent news in plain English rather than analyst shorthand.",
  },
  {
    question: "Does Metric give buy or sell recommendations?",
    answer: "No. Metric explains what a company does and how it is performing so the decision remains yours. Nothing we send is financial advice.",
  },
  {
    question: "Which stocks can I follow?",
    answer: "The briefing is designed for publicly traded US companies listed on the Nasdaq and New York Stock Exchange.",
  },
  {
    question: "How often will I receive it?",
    answer: "We send one concise briefing every trading day. You can change your watchlist or unsubscribe at any time.",
  },
  {
    question: "Can I search by company name?",
    answer: "Yes. Search by a company name such as Apple or by its ticker, such as AAPL.",
  },
];

const PRIVACY_URL = "https://metricfinance.notion.site/Privacy-Policy-377bc65fd7b380a7bb9af9f5df0b0911";

function useReveal<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return { ref, inView };
}

export function NewsletterLanding() {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [picks, setPicks] = useState<Stock[]>([]);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [slide, setSlide] = useState(0);
  const [openFaq, setOpenFaq] = useState(0);
  const [logoErrors, setLogoErrors] = useState<Set<string>>(new Set());
  const features = useReveal<HTMLElement>();
  const testimonials = useReveal<HTMLElement>();
  const faq = useReveal<HTMLElement>();
  const cta = useReveal<HTMLElement>();

  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return [];
    return STOCKS.filter(
      (stock) =>
        !picks.some((pick) => pick.symbol === stock.symbol) &&
        (stock.symbol.toLowerCase().includes(normalized) || stock.name.toLowerCase().includes(normalized)),
    ).slice(0, 6);
  }, [picks, query]);

  const isFull = picks.length === 5;
  const emailValid = /^\S+@\S+\.\S+$/.test(email.trim());

  function addStock(stock: Stock) {
    if (isFull || picks.some((pick) => pick.symbol === stock.symbol)) return;
    setPicks((current) => [...current, stock]);
    setQuery("");
    setFocused(false);
    setError("");
  }

  function removeStock(symbol: string) {
    setPicks((current) => current.filter((stock) => stock.symbol !== symbol));
    setSubmitted(false);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (picks.length === 0) {
      setError("Choose at least one stock before subscribing.");
      return;
    }
    if (!emailValid) {
      setError("That email doesn't look right. Check it and try again.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: email.trim(), tickers: picks.map((stock) => stock.symbol) }),
      });

      if (!response.ok) {
        setError("Something went wrong. Please try again in a moment.");
        return;
      }

      setSubmitted(true);
    } catch {
      setError("Something went wrong. Please try again in a moment.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <a href="#top" className={styles.logo}>Metric Finance</a>
        <nav className={styles.nav} aria-label="Main navigation">
          <a href="#faq">FAQ</a>
          <a href={PRIVACY_URL} target="_blank" rel="noreferrer">Privacy</a>
          <a href="#signup" className={styles.headerCta}>Subscribe free</a>
        </nav>
      </header>

      <section id="top" className={styles.hero}>
        <div className={styles.heroGrid} />
        <div className={styles.heroInner}>
          <h1 className={styles.fadeUp} style={{ animationDelay: "0ms" }}>Stocks explained<br />like you&apos;re 5</h1>
          <p className={`${styles.heroCopy} ${styles.fadeUp}`} style={{ animationDelay: "80ms" }}>Agentic analysis for public equities in plain English to help you become a smarter investor for free.</p>

          <div id="signup" className={`${styles.signup} ${styles.fadeUp}`} style={{ animationDelay: "160ms" }}>
            {submitted ? (
              <div className={styles.success} aria-live="polite">
                <div className={styles.successTitle}><Check size={20} /> You&apos;re in.</div>
                <p>Your first briefing will arrive at {email.trim()}.</p>
                <div className={styles.successPicks}>
                  {picks.map((stock) => <span key={stock.symbol}>{stock.symbol}</span>)}
                </div>
                <button type="button" onClick={() => setSubmitted(false)}>Edit my watchlist</button>
              </div>
            ) : (
              <form onSubmit={submit} noValidate>
                <div className={styles.stepRow}>
                  <span>
                    <span className={styles.desktopStep}>Step 1 · Choose up to five stocks you want us to follow</span>
                    <span className={styles.mobileStep}>Step 1 · Choose up to five stocks</span>
                  </span>
                  <span>{picks.length} / 5</span>
                </div>

                <div className={styles.searchWrap}>
                  <div className={`${styles.searchControl} ${focused && !isFull ? styles.controlFocused : ""}`}>
                    <Search size={19} aria-hidden="true" />
                    <input
                      value={query}
                      onChange={(event) => { setQuery(event.target.value); setFocused(true); }}
                      onFocus={() => setFocused(true)}
                      onBlur={() => window.setTimeout(() => setFocused(false), 120)}
                      placeholder={isFull ? "Your watchlist is full" : "Search a company or ticker"}
                      disabled={isFull}
                      aria-label="Search a US company or ticker"
                      role="combobox"
                      aria-autocomplete="list"
                      aria-controls="stock-search-results"
                      aria-expanded={focused && query.trim().length > 0 && !isFull}
                    />
                  </div>
                  {focused && query.trim() && !isFull ? (
                    <div id="stock-search-results" className={styles.results} role="listbox">
                      {results.length ? results.map((stock) => (
                        <button type="button" key={stock.symbol} onMouseDown={() => addStock(stock)}>
                          {logoErrors.has(stock.symbol) ? (
                            <span className={styles.resultLogoFallback}>{stock.symbol[0]}</span>
                          ) : (
                            <img
                              className={styles.resultLogo}
                              src={`https://images.financialmodelingprep.com/symbol/${stock.symbol}.png`}
                              alt=""
                              loading="lazy"
                              onError={() => setLogoErrors((current) => new Set(current).add(stock.symbol))}
                            />
                          )}
                          <strong>{stock.symbol}</strong>
                          <span>{stock.name}</span>
                          <small>{stock.exchange}</small>
                        </button>
                      )) : <p>No matching company found. Try a ticker instead.</p>}
                    </div>
                  ) : null}
                </div>

                <div className={styles.pickList}>
                  {picks.map((stock, index) => (
                    <div className={styles.pick} key={stock.symbol}>
                      <span className={styles.pickNumber}>{index + 1}</span>
                      <strong>{stock.symbol}</strong>
                      <span className={styles.pickName}>{stock.name}</span>
                      <small>{stock.exchange}</small>
                      <button type="button" onClick={() => removeStock(stock.symbol)} aria-label={`Remove ${stock.symbol}`}><X size={17} /></button>
                    </div>
                  ))}
                  {Array.from({ length: 5 - picks.length }, (_, index) => (
                    <div className={styles.ghost} key={`ghost-${index}`}>
                      <span>{picks.length + index + 1}</span>
                      This slot is still open
                    </div>
                  ))}
                  {!isFull ? (
                    <div className={styles.mobileGhost}>
                      <span>{5 - picks.length}</span>
                      {5 - picks.length === 1 ? "watchlist slot open" : "watchlist slots open"}
                    </div>
                  ) : null}
                </div>

                <div className={styles.emailStep}>Step 2 · Tell us where to send it</div>
                <div className={styles.emailRow}>
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => { setEmail(event.target.value); setError(""); }}
                    placeholder="you@email.com"
                    aria-label="Email address"
                    className={error ? styles.inputError : ""}
                  />
                  <button type="submit" disabled={!emailValid || picks.length === 0 || submitting}>
                    {submitting ? "Subscribing…" : "Subscribe"}
                  </button>
                </div>
                <p className={error ? styles.error : styles.note}>{error || "One email every trading day. Unsubscribe at any time."}</p>
              </form>
            )}
          </div>

          <div className={`${styles.stats} ${styles.fadeUp}`} style={{ animationDelay: "240ms" }}>
            <div><strong>5000+ stocks</strong><span>Nasdaq &amp; NYSE</span></div>
            <div><strong>Market context</strong><span>Without the noise</span></div>
            <div><strong>AI analysis</strong><span>Metric engine</span></div>
          </div>
        </div>
      </section>

      <section ref={features.ref} className={`${styles.featuresSection} ${features.inView ? styles.inView : ""}`}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeading}>
            <h2>What lands in your inbox</h2>
            <p>One daily email that walks through your stocks and explains what changed in plain English.</p>
          </div>
          <div className={styles.features}>
            {FEATURES.map(([number, title, copy], index) => (
              <article key={number} style={{ transitionDelay: features.inView ? `${index * 70}ms` : "0ms" }}>
                <span>{number}</span>
                <h3>{title}</h3>
                <p>{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section ref={testimonials.ref} className={`${styles.testimonialsSection} ${testimonials.inView ? styles.inView : ""}`}>
        <div className={styles.sectionInner}>
          <span className={styles.kicker}>From real users</span>
          <div className={styles.testimonialHeading}>
            <h2>Decide with confidence.</h2>
            <div>
              <span>{slide + 1} / {TESTIMONIALS.length}</span>
              <button type="button" onClick={() => setSlide((slide - 1 + TESTIMONIALS.length) % TESTIMONIALS.length)} aria-label="Previous testimonial"><ChevronLeft size={18} /></button>
              <button type="button" onClick={() => setSlide((slide + 1) % TESTIMONIALS.length)} aria-label="Next testimonial"><ChevronRight size={18} /></button>
            </div>
          </div>
          <blockquote className={styles.testimonial} key={slide}>
            <p>“{TESTIMONIALS[slide].quote}”</p>
            <footer><span /> <strong>{TESTIMONIALS[slide].author}</strong> {TESTIMONIALS[slide].role}</footer>
          </blockquote>
        </div>
      </section>

      <section id="faq" ref={faq.ref} className={`${styles.faqSection} ${faq.inView ? styles.inView : ""}`}>
        <div className={styles.faqInner}>
          <div>
            <span className={styles.kicker}>FAQ</span>
            <h2>Questions, answered plainly</h2>
          </div>
          <div className={styles.faqs}>
            {FAQS.map((item, index) => {
              const open = openFaq === index;
              return (
                <div key={item.question}>
                  <button type="button" onClick={() => setOpenFaq(open ? -1 : index)} aria-expanded={open}>
                    {item.question}<span className={open ? styles.faqIconOpen : ""}>+</span>
                  </button>
                  <div className={`${styles.faqAnswerWrap} ${open ? styles.faqAnswerOpen : ""}`}>
                    <div><p>{item.answer}</p></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section ref={cta.ref} className={`${styles.finalCta} ${cta.inView ? styles.inView : ""}`}>
        <h2>Understand stocks like a pro</h2>
        <p>Pick the stocks you care about and get the context you need in plain English every day.</p>
        <a href="#signup">Build my watchlist</a>
      </section>

      <footer className={styles.footer}>
        <span>
          Metric Finance · Built by <a href="https://www.linkedin.com/in/yashnapandugala/" target="_blank" rel="noreferrer">Yashna</a> &amp; <a href="https://www.linkedin.com/in/vanshpandita-real/" target="_blank" rel="noreferrer">Vansh</a> · Not financial advice
        </span>
      </footer>
    </div>
  );
}
