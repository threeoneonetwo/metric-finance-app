"use client";

import Link from "next/link";
import { useState } from "react";
import { StockLogo } from "@/components/stock-logo";
import styles from "@/app/learn/learn.module.css";

export type BrowserStock = { symbol: string; name: string; slug: string; sector: string };

// Browse the stock guides by sector. Every link is in the HTML, so search engines see all of them.
export function StockBrowser({ stocks, sectors }: { stocks: BrowserStock[]; sectors: string[] }) {
  const [active, setActive] = useState("All");
  const visible = (sector: string) => active === "All" || active === sector;
  return (
    <div>
      <div className={styles.filters} role="tablist" aria-label="Filter stock guides by sector">
        {["All", ...sectors].map((sector) => (
          <button key={sector} type="button" role="tab" aria-selected={active === sector} className={active === sector ? styles.filterOn : undefined} onClick={() => setActive(sector)}>
            {sector}
          </button>
        ))}
      </div>
      {sectors.map((sector) => (
        <div key={sector} hidden={!visible(sector)} className={styles.sectorBlock}>
          <h3 className={styles.sectorTitle}>{sector} <small>{stocks.filter((stock) => stock.sector === sector).length}</small></h3>
          <ul className={styles.grid}>
            {stocks.filter((stock) => stock.sector === sector).map((stock, index) => (
              <li key={stock.slug} style={{ "--i": Math.min(index, 14) } as React.CSSProperties}>
                <Link href={`/learn/stocks/${stock.slug}`}>
                  <StockLogo symbol={stock.symbol} />
                  <span className={styles.gridText}><strong>{stock.symbol}</strong><span>{stock.name}</span></span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
