"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import styles from "@/app/learn/learn.module.css";

type Result = { symbol: string; name: string; exchange: string };

// Lets visitors find the guide for any US listed stock by name or ticker.
export function StockLookupBox() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);

  useEffect(() => {
    const q = query.trim();
    if (!q) return;
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(`/api/stocks/search?q=${encodeURIComponent(q)}`, { signal: controller.signal });
        const data = (await response.json()) as { results?: Result[] };
        setResults(data.results ?? []);
      } catch {
        // Aborted or offline.
      }
    }, 150);
    return () => { controller.abort(); window.clearTimeout(timer); };
  }, [query]);

  return (
    <div className={styles.searchWrap}>
      <input
        className={styles.searchBox}
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search any US stock by name or ticker"
        aria-label="Search any US stock by name or ticker"
      />
      {query.trim() && results.length > 0 && (
        <ul className={styles.searchResults}>
          {results.map((stock) => (
            <li key={stock.symbol}>
              <Link href={`/learn/stocks/${stock.symbol.toLowerCase().replace(/\./g, "-")}`}>
                <strong>{stock.symbol}</strong>
                <span>{stock.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
