import usStocks from "@/data/us-stocks.json";
import { STOCKS, type Stock } from "./stocks";

// Every stock on the Nasdaq and NYSE (about 7,000), built from the free SEC ticker list by scripts/build-us-stocks.mjs.
// Searching and checking tickers is done against this local list, so it never uses up the market data API quota.
const FEATURED = new Map(STOCKS.map((stock) => [stock.symbol, stock]));

export const US_STOCKS: Stock[] = (usStocks as [string, string, string][]).map(([symbol, name, exchange]) => {
  return FEATURED.get(symbol) ?? { symbol, name, exchange };
});

const BY_SYMBOL = new Map(US_STOCKS.map((stock) => [stock.symbol, stock]));
// Pre-lowercased once so every search is a fast scan.
const INDEX = US_STOCKS.map((stock) => ({ stock, symbol: stock.symbol.toLowerCase(), name: stock.name.toLowerCase() }));

export function resolveStock(symbol: string): Stock | null {
  return BY_SYMBOL.get(symbol.trim().toUpperCase()) ?? null;
}

export function allResolvable(symbols: string[]): boolean {
  return symbols.every((symbol) => BY_SYMBOL.has(symbol));
}

/** Search by company name or ticker. Exact tickers first, then our featured companies, then the rest by size. */
export function searchStocks(query: string, limit = 8): Stock[] {
  const q = query.trim().toLowerCase();
  if (q.length < 1 || q.length > 40) return [];
  const scored: { stock: Stock; rank: number; order: number }[] = [];
  INDEX.forEach((entry, order) => {
    let rank = -1;
    if (entry.symbol === q) rank = 0;
    else if (entry.symbol.startsWith(q)) rank = FEATURED.has(entry.stock.symbol) ? 1 : 3;
    else if (entry.name.startsWith(q)) rank = FEATURED.has(entry.stock.symbol) ? 2 : 4;
    else if (entry.name.includes(q)) rank = 5;
    if (rank >= 0) scored.push({ stock: entry.stock, rank, order });
  });
  return scored.sort((a, b) => a.rank - b.rank || a.order - b.order).slice(0, limit).map((item) => item.stock);
}
