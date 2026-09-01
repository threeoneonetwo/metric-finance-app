"use client";

import { FormEvent, useMemo, useState } from "react";
import { Check, Clock3, Mail, Plus, Search, X } from "lucide-react";

type TrackedStock = {
  ticker: string;
  name: string;
};

const STOCKS: TrackedStock[] = [
  { ticker: "RELIANCE", name: "Reliance Industries" },
  { ticker: "HDFCBANK", name: "HDFC Bank" },
  { ticker: "TCS", name: "Tata Consultancy Services" },
  { ticker: "INFY", name: "Infosys" },
  { ticker: "ICICIBANK", name: "ICICI Bank" },
  { ticker: "SBIN", name: "State Bank of India" },
  { ticker: "BHARTIARTL", name: "Bharti Airtel" },
  { ticker: "ITC", name: "ITC" },
  { ticker: "TATAMOTORS", name: "Tata Motors" },
  { ticker: "TATAPOWER", name: "Tata Power" },
  { ticker: "TATASTEEL", name: "Tata Steel" },
  { ticker: "MARUTI", name: "Maruti Suzuki" },
  { ticker: "HINDUNILVR", name: "Hindustan Unilever" },
  { ticker: "BAJFINANCE", name: "Bajaj Finance" },
  { ticker: "KOTAKBANK", name: "Kotak Mahindra Bank" },
  { ticker: "AXISBANK", name: "Axis Bank" },
  { ticker: "LT", name: "Larsen & Toubro" },
  { ticker: "SUNPHARMA", name: "Sun Pharma" },
  { ticker: "ADANIENT", name: "Adani Enterprises" },
  { ticker: "ADANIPORTS", name: "Adani Ports" },
  { ticker: "ZOMATO", name: "Zomato" },
  { ticker: "ETERNAL", name: "Eternal" },
  { ticker: "PAYTM", name: "One 97 Communications" },
  { ticker: "NYKAA", name: "FSN E-Commerce Ventures" },
];

const POPULAR_TICKERS = ["RELIANCE", "HDFCBANK", "TCS", "INFY", "ITC"];

export function NewsletterSignupForm() {
  const [email, setEmail] = useState("");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<TrackedStock[]>([]);
  const [deliveryTime, setDeliveryTime] = useState<"9 AM" | "5 PM">("9 AM");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const suggestions = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return [];

    return STOCKS.filter(
      (stock) =>
        !selected.some((item) => item.ticker === stock.ticker) &&
        (stock.ticker.toLowerCase().includes(normalized) ||
          stock.name.toLowerCase().includes(normalized)),
    ).slice(0, 5);
  }, [query, selected]);

  function addStock(stock: TrackedStock) {
    if (selected.some((item) => item.ticker === stock.ticker) || selected.length >= 8) return;
    setSelected((current) => [...current, stock]);
    setQuery("");
    setError("");
  }

  function addTypedTicker() {
    const ticker = query.trim().toUpperCase().replace(/[^A-Z0-9&-]/g, "");
    if (!ticker || selected.length >= 8) return;
    const knownStock = STOCKS.find((stock) => stock.ticker === ticker);
    addStock(knownStock ?? { ticker, name: "Custom ticker" });
  }

  function removeStock(ticker: string) {
    setSelected((current) => current.filter((stock) => stock.ticker !== ticker));
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError("Enter a valid email address");
      return;
    }

    if (selected.length === 0) {
      setError("Choose at least one stock to track");
      return;
    }

    window.localStorage.setItem(
      "metric-newsletter-preview",
      JSON.stringify({ email, stocks: selected, deliveryTime, timezone: "EST" }),
    );
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <section className="border border-[#3f3f46] bg-[#18181b] p-6 text-center sm:p-8" aria-live="polite">
        <div className="mx-auto mb-6 flex h-11 w-11 items-center justify-center border border-[#5967a9] bg-[#202747] text-[#c6ceff]">
          <Check size={22} strokeWidth={2.25} />
        </div>
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-[#aeb8ed]">Preferences saved</p>
        <h2 className="mx-auto max-w-lg text-3xl font-bold tracking-[-0.035em] text-white sm:text-4xl">
          Your daily brief is ready
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-[#a1a1aa]">
          Your choices are saved on this device and your brief will arrive at {deliveryTime} EST when the newsletter launches
        </p>

        <div className="mt-7 border-y border-[#303034] py-5">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#71717a]">Tracking</p>
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            {selected.map((stock) => (
              <span key={stock.ticker} className="border border-[#3f3f46] bg-[#202023] px-3 py-2 text-sm font-bold text-[#d9def8]">
                {stock.ticker}
              </span>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setSubmitted(false)}
          className="mt-6 border border-[#3f3f46] bg-[#27272a] px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#303034]"
        >
          Edit preferences
        </button>
      </section>
    );
  }

  return (
    <form onSubmit={submit} className="border border-[#3f3f46] bg-[#18181b] text-center" noValidate>
      <div className="border-b border-[#303034] px-5 py-5 sm:px-7">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#aeb8ed]">Build your daily brief</p>
      </div>

      <div className="space-y-8 p-5 sm:p-7">
        <fieldset>
          <legend className="mx-auto flex items-center justify-center gap-3 text-base font-bold text-white">
            <span className="flex h-8 w-8 items-center justify-center border border-[#3f3f46] bg-[#202023] text-xs text-[#c6ceff]">1</span>
            Where should we send it?
          </legend>
          <label htmlFor="newsletter-email" className="mt-4 block text-center text-xs font-bold uppercase tracking-[0.14em] text-[#71717a]">
            Email address
          </label>
          <div className="mt-2 flex border border-[#3f3f46] bg-[#0f0f11] focus-within:border-[#7b89c6]">
            <span className="flex w-12 shrink-0 items-center justify-center text-[#71717a]">
              <Mail size={18} />
            </span>
            <input
              id="newsletter-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              className="min-w-0 flex-1 bg-transparent px-1 py-4 text-base text-white outline-none placeholder:text-[#5f5f69]"
            />
          </div>
        </fieldset>

        <fieldset>
          <legend className="mx-auto flex items-center justify-center gap-3 text-base font-bold text-white">
            <span className="flex h-8 w-8 items-center justify-center border border-[#3f3f46] bg-[#202023] text-xs text-[#c6ceff]">2</span>
            Which stocks do you follow?
          </legend>
          <p className="mt-3 text-sm leading-6 text-[#8e909f]">Choose up to 8 NSE or BSE listed companies</p>

          <div className="relative mt-4">
            <div className="flex border border-[#3f3f46] bg-[#0f0f11] focus-within:border-[#7b89c6]">
              <span className="flex w-12 shrink-0 items-center justify-center text-[#71717a]">
                <Search size={18} />
              </span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    if (suggestions[0]) addStock(suggestions[0]);
                    else addTypedTicker();
                  }
                }}
                placeholder="Search a company or ticker"
                className="min-w-0 flex-1 bg-transparent px-1 py-4 text-base text-white outline-none placeholder:text-[#5f5f69]"
                aria-label="Search stocks"
              />
              <button
                type="button"
                onClick={() => (suggestions[0] ? addStock(suggestions[0]) : addTypedTicker())}
                disabled={!query.trim() || selected.length >= 8}
                className="m-2 flex w-11 items-center justify-center border border-[#3f3f46] bg-[#27272a] text-white disabled:cursor-not-allowed disabled:opacity-35"
                aria-label="Add stock"
              >
                <Plus size={17} />
              </button>
            </div>

            {suggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full z-20 border-x border-b border-[#3f3f46] bg-[#18181b] shadow-2xl shadow-black/60">
                {suggestions.map((stock) => (
                  <button
                    key={stock.ticker}
                    type="button"
                    onClick={() => addStock(stock)}
                    className="flex w-full items-center justify-center gap-4 border-b border-[#27272a] px-4 py-3 text-center last:border-b-0 hover:bg-[#202023]"
                  >
                    <span>
                      <span className="block text-sm font-bold text-white">{stock.ticker}</span>
                      <span className="mt-0.5 block text-xs text-[#71717a]">{stock.name}</span>
                    </span>
                    <Plus size={16} className="text-[#aeb8ed]" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="mt-3 flex flex-wrap justify-center gap-2">
            {POPULAR_TICKERS.filter((ticker) => !selected.some((stock) => stock.ticker === ticker)).map((ticker) => {
              const stock = STOCKS.find((item) => item.ticker === ticker)!;
              return (
                <button
                  type="button"
                  key={ticker}
                  onClick={() => addStock(stock)}
                  disabled={selected.length >= 8}
                  className="border border-[#303034] bg-[#202023] px-3 py-2 text-xs font-bold text-[#a1a1aa] hover:border-[#5967a9] hover:text-white disabled:opacity-35"
                >
                  + {ticker}
                </button>
              );
            })}
          </div>

          {selected.length > 0 && (
            <div className="mt-4 flex flex-wrap justify-center gap-2" aria-label="Selected stocks">
              {selected.map((stock) => (
                <span key={stock.ticker} className="inline-flex items-center gap-2 border border-[#5967a9] bg-[#202747] px-3 py-2 text-sm font-bold text-[#d9def8]">
                  {stock.ticker}
                  <button type="button" onClick={() => removeStock(stock.ticker)} aria-label={`Remove ${stock.ticker}`} className="text-[#9ca8df] hover:text-white">
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </fieldset>

        <fieldset>
          <legend className="mx-auto flex items-center justify-center gap-3 text-base font-bold text-white">
            <span className="flex h-8 w-8 items-center justify-center border border-[#3f3f46] bg-[#202023] text-xs text-[#c6ceff]">3</span>
            When should it arrive?
          </legend>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {(["9 AM", "5 PM"] as const).map((time) => {
              const active = deliveryTime === time;
              return (
                <button
                  key={time}
                  type="button"
                  onClick={() => setDeliveryTime(time)}
                  className={`flex min-h-24 flex-col items-center justify-between border p-4 text-center transition ${
                    active
                      ? "border-[#7b89c6] bg-[#202747] text-white"
                      : "border-[#3f3f46] bg-[#202023] text-[#a1a1aa] hover:border-[#5967a9]"
                  }`}
                  aria-pressed={active}
                >
                  <Clock3 size={18} className={active ? "text-[#c6ceff]" : "text-[#71717a]"} />
                  <span>
                    <span className="block text-lg font-bold">{time} EST</span>
                    <span className="mt-1 block text-xs font-normal text-[#8e909f]">{time === "9 AM" ? "Before markets move" : "After the closing bell"}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </fieldset>

        {error && <p className="border border-[#713642] bg-[#2a171b] px-4 py-3 text-sm text-[#ffb2ba]">{error}</p>}

        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 border border-[#7b89c6] bg-[#d9def8] px-5 py-4 text-base font-bold text-[#11131c] transition hover:-translate-y-0.5 hover:bg-white active:translate-y-0"
        >
          Join the newsletter
          <span aria-hidden="true">→</span>
        </button>
        <p className="text-center text-xs leading-5 text-[#71717a]">Free to join with no spam and a simple way to unsubscribe any time</p>
      </div>
    </form>
  );
}
