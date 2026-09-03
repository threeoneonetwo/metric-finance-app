"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import styles from "./newsletter-landing.module.css";
import { StockPicker } from "./stock-picker";
import type { Stock } from "@/lib/stocks";

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

function SectionWave() {
  return (
    <svg className={styles.sectionWave} viewBox="0 0 1600 60" preserveAspectRatio="none" aria-hidden="true">
      <path d="M0,30 C220,4 420,56 640,28 C860,0 1080,52 1300,24 C1420,8 1520,34 1600,18" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function NewsletterLanding() {
  const [picks, setPicks] = useState<Stock[]>([]);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [slide, setSlide] = useState(0);
  const [openFaq, setOpenFaq] = useState(0);
  const features = useReveal<HTMLElement>();
  const testimonials = useReveal<HTMLElement>();
  const faq = useReveal<HTMLElement>();
  const cta = useReveal<HTMLElement>();

  const emailValid = /^\S+@\S+\.\S+$/.test(email.trim());

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

        <div className={styles.heroDecor} aria-hidden="true">
          <div className={`${styles.decorCard} ${styles.decorTicker}`}>
            <div className={styles.decorTickerTop}>
              <span>AAPL</span>
              <span className={styles.decorChangeUp}>+1.08%</span>
            </div>
            <svg viewBox="0 0 120 40" preserveAspectRatio="none" className={styles.decorSparkline}>
              <polyline points="0,32 15,27 30,30 45,20 60,23 75,12 90,16 105,6 120,10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className={styles.decorCaption}>Services revenue at a record</span>
          </div>

          <div className={`${styles.decorCard} ${styles.decorBriefing}`}>
            <span className={styles.decorLabel}>Today&apos;s briefing</span>
            <strong className={styles.decorHeadline}>Why NVDA moved</strong>
            <span className={styles.decorTextBar} style={{ width: "90%" }} />
            <span className={styles.decorTextBar} style={{ width: "64%" }} />
          </div>

          <div className={`${styles.decorCard} ${styles.decorFundamentals}`}>
            <span className={styles.decorLabel}>Fundamentals · TSLA</span>
            {[["Margin", 62], ["Cash", 78], ["Debt", 32]].map(([label, pct]) => (
              <div className={styles.decorMetricRow} key={label}>
                <span>{label}</span>
                <span className={styles.decorMeter}><span style={{ width: `${pct}%` }} /></span>
              </div>
            ))}
          </div>

          <div className={`${styles.decorCard} ${styles.decorPeers}`}>
            <span className={styles.decorLabel}>Peers</span>
            <div className={styles.decorBars}>
              {[38, 54, 84, 46, 30].map((height, index) => (
                <span key={index} style={{ height: `${height}%` }} className={index === 2 ? styles.decorBarActive : ""} />
              ))}
            </div>
          </div>

          <svg className={styles.decorWave} viewBox="0 0 1600 100" preserveAspectRatio="none">
            <path d="M0,80 C220,20 420,110 640,55 C860,5 1080,95 1300,45 C1420,20 1520,60 1600,35" fill="none" stroke="currentColor" strokeWidth="2" />
          </svg>
        </div>

        <div className={styles.heroInner}>
          <h1 className={styles.fadeUp} style={{ animationDelay: "0ms" }}>Stocks explained<br />like you&apos;re 5</h1>
          <p className={`${styles.heroCopy} ${styles.fadeUp}`} style={{ animationDelay: "80ms" }}>A bite sized breakdown of only the stocks you&apos;re interested in, to help you become a smarter investor for free.</p>

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
                <StockPicker
                  picks={picks}
                  onPicksChange={(next) => { setPicks(next); setError(""); setSubmitted(false); }}
                  label="Step 1 · Choose up to five stocks you want us to follow"
                  mobileLabel="Step 1 · Choose up to five stocks"
                />

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
            <div><strong>Daily analysis</strong><span>Metric engine</span></div>
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

      <SectionWave />
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

      <SectionWave />
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

      <SectionWave />
      <section ref={cta.ref} className={`${styles.finalCta} ${cta.inView ? styles.inView : ""}`}>
        <h2>Understand stocks<br />like a pro</h2>
        <p>Pick the stocks you care about and get the context you need in plain English every day.</p>
        <a href="#signup">Build my watchlist</a>
      </section>

      <SectionWave />
      <footer className={styles.footer}>
        <span>
          Metric Finance · Built by <a href="https://www.linkedin.com/in/yashnapandugala/" target="_blank" rel="noreferrer">Yashna</a> &amp; <a href="https://www.linkedin.com/in/vanshpandita-real/" target="_blank" rel="noreferrer">Vansh</a> · Not financial advice
        </span>
      </footer>
    </div>
  );
}
