"use client";

// "Try it first": a visitor picks a stock (or is already on its Learn page) and reads a short explainer of what happened to it
// at the last close, in the same voice as the daily brief, without giving us their email. Under it we offer that stock daily:
// on the homepage it is added to the signup picker below, on Learn pages there is an email box right there.
// Nothing is fetched until someone clicks, so crawlers never run it.
import { FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Search, Sparkles } from "lucide-react";
import { WhyCard } from "./why-card";
import styles from "./instant-explainer.module.css";
import { getPostHogVisitorId, trackPostHogEvent } from "@/lib/posthog";
import type { InstantExplainer } from "@/lib/instant/explain";

type Explainer = InstantExplainer;

type Result = { symbol: string; name: string };

// Popular stocks people can try with one tap on the homepage.
const QUICK_PICKS = ["NVDA", "TSLA", "AAPL", "AMZN", "PLTR"];

// What we tell people while they wait (it can take a few seconds the first time a stock is asked for).
const WAIT_LINES = ["Checking the last close", "Reading the latest headlines", "Writing it like you're 5"];

type Props = {
  /** Where it sits: "home" shows a search box, "learn" explains the page's own stock. */
  from: "home" | "learn";
  symbol?: string;
  name?: string;
  /** Homepage only: adds the stock to the signup picker and scrolls there, instead of showing an email box. */
  onFollow?: (stock: { symbol: string; name: string; exchange: string }) => void;
};

export function InstantExplainer({ from, symbol: fixedSymbol, name: fixedName, onFollow }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [loadingSymbol, setLoadingSymbol] = useState<string | null>(null);
  const [waitLine, setWaitLine] = useState(0);
  const [explainer, setExplainer] = useState<Explainer | null>(null);
  const [failure, setFailure] = useState<{ symbol: string; text: string } | null>(null);
  const [email, setEmail] = useState("");
  const [signupError, setSignupError] = useState("");
  const [signingUp, setSigningUp] = useState(false);
  const resultRef = useRef<HTMLDivElement | null>(null);

  // Searches as you type, like the signup picker.
  useEffect(() => {
    const q = query.trim();
    if (!q) return;
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(`/api/stocks/search?q=${encodeURIComponent(q)}`, { signal: controller.signal });
        const data = (await response.json()) as { results?: Result[] };
        setResults((data.results ?? []).slice(0, 6));
      } catch {
        // Aborted or offline.
      }
    }, 150);
    return () => { controller.abort(); window.clearTimeout(timer); };
  }, [query]);

  // Rotates the waiting message.
  useEffect(() => {
    if (!loadingSymbol) return;
    const timer = window.setInterval(() => setWaitLine((line) => Math.min(line + 1, WAIT_LINES.length - 1)), 2200);
    return () => window.clearInterval(timer);
  }, [loadingSymbol]);

  // Asks the server for the explainer.
  async function explain(symbol: string) {
    setQuery("");
    setResults([]);
    setExplainer(null);
    setFailure(null);
    setSignupError("");
    setWaitLine(0);
    setLoadingSymbol(symbol);
    trackPostHogEvent("instant_explainer_requested", { symbol, from });
    try {
      const response = await fetch(`/api/instant?symbol=${encodeURIComponent(symbol)}&from=${from}`);
      const data = (await response.json()) as { explainer?: Explainer; error?: string };
      if (response.ok && data.explainer) {
        setExplainer(data.explainer);
        trackPostHogEvent("instant_explainer_shown", { symbol, from });
      } else {
        setFailure({ symbol, text: data.error ?? "Something went wrong. Try again in a moment." });
      }
    } catch {
      setFailure({ symbol, text: "Something went wrong. Try again in a moment." });
    } finally {
      setLoadingSymbol(null);
      window.setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 60);
    }
  }

  // Signs them up with this one stock already on their watchlist.
  async function signup(event: FormEvent<HTMLFormElement>, symbol: string) {
    event.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setSignupError("That email doesn't look right. Check it and try again.");
      return;
    }
    setSigningUp(true);
    setSignupError("");
    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: email.trim(), tickers: [symbol], visitorId: getPostHogVisitorId(), source: `instant_${from}` }),
      });
      if (response.status === 409) {
        setSignupError("You've already signed up with this email. We just sent a link to your dashboard, where you can add this stock.");
        return;
      }
      if (!response.ok) {
        setSignupError("Something went wrong. Please try again in a moment.");
        return;
      }
      trackPostHogEvent("instant_signup_submitted", { symbol, from });
      try {
        sessionStorage.setItem("mf_pending_signup", JSON.stringify({ email: email.trim(), tickers: [symbol] }));
      } catch {
        // Storage unavailable; the confirm page falls back to generic copy.
      }
      router.push("/confirm-email");
    } catch {
      setSignupError("Something went wrong. Please try again in a moment.");
    } finally {
      setSigningUp(false);
    }
  }

  const shownSymbol = explainer?.symbol ?? failure?.symbol ?? null;

  return (
    <div className={`${styles.wrap} ${from === "learn" ? styles.learn : ""}`}>
      {from === "home" ? (
        <>
          <div className={styles.searchWrap}>
            <label className={styles.search}>
              <Search size={19} aria-hidden="true" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => { if (event.key === "Enter" && results[0]) explain(results[0].symbol); }}
                placeholder="Search any stock, like Tesla"
                aria-label="Search for a stock to explain"
                disabled={Boolean(loadingSymbol)}
              />
            </label>
            {query.trim() && results.length > 0 && (
              <ul className={styles.results}>
                {results.map((stock) => (
                  <li key={stock.symbol}>
                    <button type="button" onClick={() => explain(stock.symbol)}>
                      <strong>{stock.symbol}</strong><span>{stock.name}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className={styles.quick}>
            <span>Or try</span>
            {QUICK_PICKS.map((symbol) => (
              <button type="button" key={symbol} onClick={() => explain(symbol)} disabled={Boolean(loadingSymbol)}>{symbol}</button>
            ))}
          </div>
        </>
      ) : (
        !explainer && !loadingSymbol && !failure && fixedSymbol && (
          <div className={styles.prompt}>
            <div>
              <strong>What&apos;s up with {fixedSymbol}?</strong>
              <p>See what happened to {fixedName ?? fixedSymbol} at the last close, and why, in plain words. Takes about ten seconds. Free, no signup.</p>
            </div>
            <button type="button" className={styles.primary} onClick={() => explain(fixedSymbol)}>
              <Sparkles size={16} /> Explain {fixedSymbol}
            </button>
          </div>
        )
      )}

      <div ref={resultRef} aria-live="polite">
        {loadingSymbol && (
          <div className={styles.loading}>
            <span className={styles.spinner} aria-hidden="true" />
            <div>
              <strong>{loadingSymbol}</strong>
              <p>{WAIT_LINES[waitLine]}…</p>
            </div>
          </div>
        )}

        {failure && !loadingSymbol && <p className={styles.failure}>{failure.text}</p>}

        {explainer && !loadingSymbol && (
          <WhyCard explainer={explainer} shareLink />
        )}

        {shownSymbol && !loadingSymbol && onFollow && (
          <div className={styles.signup}>
            <strong>Want {shownSymbol} explained {explainer ? "like this " : ""}every trading day?</strong>
            <p>Pick up to five stocks below and we&apos;ll post a free brief on all of them every trading day at 5 PM ET.</p>
            <button type="button" className={styles.primary} onClick={() => onFollow({ symbol: shownSymbol, name: explainer?.company ?? shownSymbol, exchange: explainer?.exchange ?? "" })}>
              Add {shownSymbol} to my daily brief <ArrowRight size={15} />
            </button>
          </div>
        )}

        {shownSymbol && !loadingSymbol && !onFollow && (
          <form className={styles.signup} onSubmit={(event) => signup(event, shownSymbol)} noValidate>
            <strong>Want {shownSymbol} explained {explainer ? "like this " : ""}every trading day?</strong>
            <p>We post a free brief at 5 PM ET for {shownSymbol} and up to 4 more stocks you pick. Unsubscribe anytime.</p>
            <div className={styles.emailRow}>
              <input
                type="email"
                value={email}
                onChange={(event) => { setEmail(event.target.value); setSignupError(""); }}
                placeholder="you@email.com"
                aria-label="Email address"
              />
              <button type="submit" className={styles.primary} disabled={signingUp}>
                {signingUp ? "Signing you up…" : <>Send me {shownSymbol} daily <ArrowRight size={15} /></>}
              </button>
            </div>
            {signupError && <p className={styles.signupError}>{signupError}</p>}
          </form>
        )}
      </div>
    </div>
  );
}
