"use client";

import { useState } from "react";
import styles from "@/app/learn/learn.module.css";

// Company logo from the market data provider's image host, with a letter fallback when none exists.
export function StockLogo({ symbol, large = false }: { symbol: string; large?: boolean }) {
  const [failed, setFailed] = useState(false);
  return (
    <span className={`${styles.logo} ${large ? styles.logoLarge : ""}`} aria-hidden="true">
      {failed ? (
        symbol[0]
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={`https://images.financialmodelingprep.com/symbol/${symbol.replace(".", "-")}.png`} alt="" loading="lazy" onError={() => setFailed(true)} />
      )}
    </span>
  );
}
