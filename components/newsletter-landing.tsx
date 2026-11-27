"use client";

// The homepage. From top to bottom: a hero with the stock search and the day's biggest moves, the signup form, what is in the brief, our promises, FAQ and a final call to action.
import { FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Check } from "lucide-react";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";
import styles from "./newsletter-landing.module.css";
import { StockPicker } from "./stock-picker";
import { InstantExplainer } from "./instant-explainer";
import { MoversStrip, type Mover } from "./movers-strip";
import instantStyles from "./instant-explainer.module.css";
import { isIuEmail, limitsFor, stocksInWords } from "@/lib/plan";
import { FAQS } from "@/lib/faqs";
import { getPostHogVisitorId, trackPostHogEvent } from "@/lib/posthog";
import { type Stock } from "@/lib/stocks";

const FEATURES = [
  ["01", "Price action", "What the stock did today, and the clearest explanation of why it moved."],
  ["02", "Fundamentals", "Revenue, margins, cash, and debt translated out of accounting language."],
  ["03", "Peer comparison", "How each company is performing against the businesses it actually competes with."],
  ["04", "News", "The headlines that matter to your holdings, with the rest of the noise removed."],
  ["05", "Ask follow up questions", "Still curious? Ask anything about your stocks right inside the brief and get a clear answer from the same data."],
] as const;

// Four promises shown where the testimonials used to be. Every one of them is true of how the brief is made.
const PROMISES = [
  ["Never tells you what to buy", "We explain what happened and why. We never say buy, sell or hold, and questions asking for tips get a polite no."],
  ["Every number has a source", "Prices come from Nasdaq, company numbers from SEC filings, news from the day's headlines. When the reason for a move isn't clear, the brief says so."],
  ["Free, with no ads", "No paywall, no sponsored picks and no credit card. Unsubscribe with one click."],
  ["Real people behind it", "Built by Yashna and Vansh. Reply to any email and it reaches us, not a support queue."],
] as const;


function useReveal<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return [ref, inView] as const;
}

// Small chart style thumbnails that hint at what each part of the brief shows.
function FeatureGlyph({ kind }: { kind: number }) {
  return (
    <svg className={styles.inboxGlyph} viewBox="0 0 84 60" aria-hidden="true">
      {kind === 0 && <polyline points="8,42 22,34 34,38 48,24 60,28 76,14" fill="none" stroke="#6fe0a8" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />}
      {kind === 1 && (
        <g fill="#7aa2ff">
          <rect x="14" y="26" width="10" height="22" rx="2" />
          <rect x="30" y="12" width="10" height="36" rx="2" />
          <rect x="46" y="32" width="10" height="16" rx="2" opacity=".55" />
          <rect x="62" y="20" width="10" height="28" rx="2" />
        </g>
      )}
      {kind === 2 && (
        <g>
          <rect x="14" y="14" width="56" height="7" rx="3.5" fill="#b3c9ff" />
          <rect x="14" y="27" width="40" height="7" rx="3.5" fill="#7aa2ff" />
          <rect x="14" y="40" width="26" height="7" rx="3.5" fill="#7aa2ff" opacity=".55" />
        </g>
      )}
      {kind === 3 && (
        <g fill="#7aa2ff">
          <rect x="14" y="14" width="44" height="6" rx="3" fill="#b3c9ff" />
          <rect x="14" y="27" width="56" height="5" rx="2.5" opacity=".6" />
          <rect x="14" y="37" width="50" height="5" rx="2.5" opacity=".4" />
          <rect x="14" y="47" width="34" height="5" rx="2.5" opacity=".3" />
        </g>
      )}
      {kind === 4 && (
        <g>
          <rect x="10" y="10" width="44" height="18" rx="7" fill="#7aa2ff" />
          <rect x="30" y="33" width="44" height="18" rx="7" fill="#1f2b48" stroke="#b3c9ff" strokeWidth="1.6" />
          <circle cx="42" cy="42" r="2" fill="#b3c9ff" />
          <circle cx="52" cy="42" r="2" fill="#b3c9ff" />
          <circle cx="62" cy="42" r="2" fill="#b3c9ff" />
        </g>
      )}
    </svg>
  );
}

function SectionWave() {
  return <hr className={styles.sectionWave} aria-hidden="true" />;
}

// Also which FAQ answer is open.
export function NewsletterLanding({ movers = [] }: { movers?: Mover[] }) {
  const [picks, setPicks] = useState<Stock[]>([]);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);
  const [featuresRef, featuresInView] = useReveal<HTMLElement>();
  const [promisesRef, promisesInView] = useReveal<HTMLElement>();
  const [faqRef, faqInView] = useReveal<HTMLElement>();
  const [ctaRef, ctaInView] = useReveal<HTMLElement>();

  const emailValid = /^\S+@\S+\.\S+$/.test(email.trim());
  // IU addresses get a bigger watchlist; the picker grows as soon as one is typed.
  const limits = limitsFor(email);
  const iuReader = isIuEmail(email);
  const router = useRouter();

  // "Add to my daily brief" under an explainer: puts that stock in the picker (if there is room) and scrolls to the signup.
  function follow(stock: { symbol: string; name: string; exchange: string }) {
    if (!picks.some((pick) => pick.symbol === stock.symbol)) {
      if (picks.length >= limits.stocks) {
        setError(`You can follow up to ${stocksInWords(limits.stocks)} stocks. Remove one to add ${stock.symbol}.`);
      } else {
        if (picks.length === 0) trackPostHogEvent("signup_started", { tickers_count: 1, from: "explainer" });
        setPicks([...picks, { symbol: stock.symbol, name: stock.name, exchange: stock.exchange }]);
        setError("");
      }
    }
    setSubmitted(false);
    document.getElementById("signup")?.scrollIntoView({ behavior: "smooth", block: "start" });
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
    if (picks.length > limits.stocks) {
      setError(`This email can follow up to ${stocksInWords(limits.stocks)} stocks. Remove ${picks.length - limits.stocks} to continue.`);
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: email.trim(), tickers: picks.map((stock) => stock.symbol), visitorId: getPostHogVisitorId() }),
      });

      if (response.status === 409) {
        setError("You've already signed up with this email. We just sent a link to your dashboard to that address.");
        return;
      }

      if (!response.ok) {
        setError("Something went wrong. Please try again in a moment.");
        return;
      }

      try {
        sessionStorage.setItem(
          "mf_pending_signup",
          JSON.stringify({ email: email.trim(), tickers: picks.map((stock) => stock.symbol) }),
        );
      } catch {
        // Storage unavailable; the confirm page falls back to generic copy.
      }
      router.push("/confirm-email");
    } catch {
      setError("Something went wrong. Please try again in a moment.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.page}>
      <SiteHeader signIn />

      <section id="top" className={styles.hero}>

        <div className={styles.heroInner}>
          <h1 className={styles.fadeUp} style={{ animationDelay: "0ms" }}>Stocks<br className={styles.mobileBreak} /> explained<br />like you&apos;re 5</h1>
          <p className={styles.heroCopy}>Search any US stock and see what happened at the last close, and why, in words anyone can follow. Free, no signup.</p>

          {/* The search: any stock, explained from its last close. "Add to my daily brief" drops it into the signup picker below. */}
          <div className={instantStyles.heroSearch}>
            <InstantExplainer from="home" onFollow={follow} />
          </div>

        </div>

        {/* Popular stocks with their move at the last close, so it's obvious the site is fresh every trading day. */}
        <MoversStrip movers={movers} />
      </section>

      {/* Daily brief signup: pick up to five stocks (or more for IU emails) and get a brief on them every trading day. */}
      <section id="signup" className={instantStyles.trySection}>
        <div className={instantStyles.tryHead}>
          <span>Free daily brief</span>
          <h2>Stay on top of your portfolio</h2>
          <p>Pick up to {stocksInWords(limits.stocks)} stocks you own or watch. Every trading day at 5 PM ET we post a short brief on what moved and why, and email you when it&apos;s up.</p>
        </div>
        <div className={instantStyles.signupBox}>
            <div className={styles.signup}>
              {submitted ? (
                <div className={styles.success} aria-live="polite">
                  <div className={styles.successTitle}><Check size={20} /> You&apos;re in.</div>
                  <p>We will email {email.trim()} when your first brief is up.</p>
                  <div className={styles.successPicks}>
                    {picks.map((stock) => <span key={stock.symbol}>{stock.symbol}</span>)}
                  </div>
                  <button type="button" onClick={() => setSubmitted(false)}>Edit my watchlist</button>
                </div>
              ) : (
                <form onSubmit={submit} noValidate>
                  <StockPicker
                    picks={picks}
                    onPicksChange={(next) => {
                      if (picks.length === 0 && next.length > 0) trackPostHogEvent("signup_started", { tickers_count: next.length });
                      setPicks(next); setError(""); setSubmitted(false);
                    }}
                    label={`Step 1 · Choose up to ${stocksInWords(limits.stocks)} stocks you want us to follow`}
                    mobileLabel={`Step 1 · Choose up to ${stocksInWords(limits.stocks)} stocks`}
                    maxPicks={Math.max(limits.stocks, picks.length)}
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
                  <p className={error ? styles.error : styles.note}>{error || (iuReader ? "Nice, an IU email. You get up to 15 stocks and 15 follow up questions a day, so add more stocks above if you like." : "We email you when your brief is posted at 5 PM ET. Unsubscribe at any time.")}</p>
                  <Link href="/brief" className={styles.sampleLink}>Read a sample brief <ArrowRight size={15} /></Link>
                </form>
              )}
            </div>
        </div>
      </section>

      <SectionWave />
      <section ref={featuresRef} className={`${styles.featuresSection} ${featuresInView ? styles.inView : ""}`}>
        <div className={styles.sectionInner}>
          <div className={styles.inboxHeading}>
            <span className={styles.inboxEyebrow}><i /> Every trading day at 5 PM ET</span>
            <h2>What&apos;s in<br className={styles.inboxBreak} /> your daily brief</h2>
            <p>One short brief, posted right after the market closes, walks through your stocks and explains what changed in simple words.</p>
          </div>
          <div className={styles.inboxList}>
            {FEATURES.map(([number, title, copy], index) => (
              <article className={styles.inboxRow} key={number} style={{ transitionDelay: featuresInView ? `${120 + index * 90}ms` : "0ms" }}>
                <span className={styles.inboxNumber}>{number}</span>
                <div className={styles.inboxText}>
                  <h3>{title}</h3>
                  <p>{copy}</p>
                </div>
                <FeatureGlyph kind={index} />
              </article>
            ))}
          </div>
        </div>
      </section>

      <SectionWave />
      {/* Four plain promises about how the brief is made. */}
      <section ref={promisesRef} className={`${styles.testimonialsSection} ${promisesInView ? styles.inView : ""}`}>
        <div className={styles.sectionInner}>
          <div className={styles.quoteHead}>
            <span className={styles.inboxEyebrow}><i /> Our promises</span>
            <h2>Why you can trust it</h2>
          </div>
          <div className={styles.promises}>
            {PROMISES.map(([title, copy]) => (
              <article key={title}>
                <h3>{title}</h3>
                <p>{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <SectionWave />
      <section id="faq" ref={faqRef} className={`${styles.faqSection} ${faqInView ? styles.inView : ""}`}>
        <div className={styles.faqInner}>
          <div>
            <span className={styles.kicker}>FAQ</span>
            <h2>Questions, answered plainly</h2>
          </div>
          <div className={styles.faqs}>
            {FAQS.map((item, index) => {
              const open = openFaq === index;
              return (
                <div key={item.question} className={styles.faqRow} style={{ transitionDelay: faqInView ? `${120 + index * 70}ms` : "0ms" }}>
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
      <section ref={ctaRef} className={`${styles.finalCta} ${ctaInView ? styles.inView : ""}`}>
        <div className={styles.ctaPanel}>
          <div className={styles.ctaGlow} aria-hidden="true" />
          <span className={styles.inboxEyebrow}><i /> Ready when you are</span>
          <h2>Finally get what&apos;s going on with your stocks</h2>
          <p>Pick the stocks you care about. Every trading day at 5 PM ET you get the what and the why, in words anyone can follow.</p>
          <div className={styles.ctaActions}>
            <a href="#signup" className={styles.ctaPrimary}>Build my watchlist <ArrowRight size={16} /></a>
            <Link href="/brief" className={styles.ctaSecondary}>Read a sample brief</Link>
          </div>
          <ul className={styles.ctaPerks}>
            <li><Check size={14} /> Free</li>
            <li><Check size={14} /> No credit card</li>
            <li><Check size={14} /> Unsubscribe anytime</li>
          </ul>
        </div>
      </section>

      <SectionWave />
      <SiteFooter />
    </div>
  );
}
