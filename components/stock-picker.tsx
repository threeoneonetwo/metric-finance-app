"use client";

import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
// Shares the landing page stylesheet so both surfaces stay visually identical.
import styles from "./newsletter-landing.module.css";
import { MAX_PICKS, STOCKS, type Stock } from "@/lib/stocks";

type StockPickerProps = {
  picks: Stock[];
  onPicksChange: (picks: Stock[]) => void;
  label: string;
  mobileLabel: string;
};

export function StockPicker({ picks, onPicksChange, label, mobileLabel }: StockPickerProps) {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [logoErrors, setLogoErrors] = useState<Set<string>>(new Set());

  const handleLogoError = (symbol: string) => setLogoErrors((current) => new Set(current).add(symbol));

  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return [];
    return STOCKS.filter(
      (stock) =>
        !picks.some((pick) => pick.symbol === stock.symbol) &&
        (stock.symbol.toLowerCase().includes(normalized) || stock.name.toLowerCase().includes(normalized)),
    ).slice(0, 6);
  }, [picks, query]);

  const isFull = picks.length === MAX_PICKS;
  const openSlots = MAX_PICKS - picks.length;

  function addStock(stock: Stock) {
    if (isFull || picks.some((pick) => pick.symbol === stock.symbol)) return;
    onPicksChange([...picks, stock]);
    setQuery("");
    setFocused(false);
  }

  function removeStock(symbol: string) {
    onPicksChange(picks.filter((stock) => stock.symbol !== symbol));
  }

  return (
    <>
      <div className={styles.stepRow}>
        <span>
          <span className={styles.desktopStep}>{label}</span>
          <span className={styles.mobileStep}>{mobileLabel}</span>
        </span>
        <span>{picks.length} / {MAX_PICKS}</span>
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
                <StockLogo symbol={stock.symbol} hasError={logoErrors.has(stock.symbol)} onError={handleLogoError} className={styles.resultLogo} fallbackClassName={styles.resultLogoFallback} />
                <strong>{stock.symbol}</strong>
                <span>{stock.name}</span>
                <small>{stock.exchange}</small>
              </button>
            )) : <p>No matching company found. Try a ticker instead.</p>}
          </div>
        ) : null}
      </div>

      {picks.length > 0 ? (
        <div className={styles.pickList}>
          {picks.map((stock, index) => (
            <div className={styles.pick} key={stock.symbol}>
              <span className={styles.pickNumber}>{index + 1}</span>
              <StockLogo symbol={stock.symbol} hasError={logoErrors.has(stock.symbol)} onError={handleLogoError} className={styles.pickLogo} fallbackClassName={styles.pickLogoFallback} />
              <strong>{stock.symbol}</strong>
              <span className={styles.pickName}>{stock.name}</span>
              <small>{stock.exchange}</small>
              <button type="button" onClick={() => removeStock(stock.symbol)} aria-label={`Remove ${stock.symbol}`}><X size={17} /></button>
            </div>
          ))}
          {Array.from({ length: openSlots }, (_, index) => (
            <div className={styles.ghost} key={`ghost-${index}`}>
              <span>{picks.length + index + 1}</span>
              This slot is still open
            </div>
          ))}
          {!isFull ? (
            <div className={styles.mobileGhost}>
              <span>{openSlots}</span>
              {openSlots === 1 ? "watchlist slot open" : "watchlist slots open"}
            </div>
          ) : null}
        </div>
      ) : null}
    </>
  );
}

function StockLogo({
  symbol,
  hasError,
  onError,
  className,
  fallbackClassName,
}: {
  symbol: string;
  hasError: boolean;
  onError: (symbol: string) => void;
  className: string;
  fallbackClassName: string;
}) {
  if (hasError) {
    return <span className={fallbackClassName}>{symbol[0]}</span>;
  }
  return (
    <img
      className={className}
      src={`https://images.financialmodelingprep.com/symbol/${symbol}.png`}
      alt=""
      loading="lazy"
      onError={() => onError(symbol)}
    />
  );
}
