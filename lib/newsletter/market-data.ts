import profiles from "@/data/stock-profiles.json";
import { resolveStock } from "@/lib/stock-lookup";

const FMP_BASE_URL = "https://financialmodelingprep.com/stable";
const NASDAQ_BASE_URL = "https://api.nasdaq.com/api/quote";

export type TickerSnapshot = {
  ticker: string;
  companyName: string;
  price: number | null;
  dayChangePercent: number | null;
  dayHigh: number | null;
  dayLow: number | null;
  volume: number | null;
  marketCap: number | null;
};

type FmpQuote = {
  symbol?: string;
  name?: string;
  price?: number | null;
  changePercentage?: number | null;
  dayLow?: number | null;
  dayHigh?: number | null;
  volume?: number | null;
  marketCap?: number | null;
};

export function hasFmpConfig() {
  return Boolean(process.env.FMP_API_KEY);
}

const toNumber = (value: unknown) => {
  const parsed = Number(String(value ?? "").replace(/[$,%+\s]/g, "").replace(/,/g, ""));
  return String(value ?? "").trim() !== "" && Number.isFinite(parsed) ? parsed : null;
};

/**
 * The free market data plan only covers a short list of symbols (many well known stocks answer "premium"), so any
 * stock it refuses is quoted from Nasdaq's public quote service instead. Same fields, no key, no daily limit.
 */
async function nasdaqSnapshot(ticker: string): Promise<TickerSnapshot | null> {
  const headers = { Accept: "application/json", "User-Agent": "Mozilla/5.0" }; // Nasdaq stalls unfamiliar user agents
  const symbol = encodeURIComponent(ticker);
  try {
    const [info, summary] = await Promise.all([
      fetch(`${NASDAQ_BASE_URL}/${symbol}/info?assetclass=stocks`, { cache: "no-store", headers, signal: AbortSignal.timeout(8000) }).then((r) => r.json()),
      fetch(`${NASDAQ_BASE_URL}/${symbol}/summary?assetclass=stocks`, { cache: "no-store", headers, signal: AbortSignal.timeout(8000) })
        .then((r) => r.json())
        .catch(() => null),
    ]);
    const primary = info?.data?.primaryData;
    const price = toNumber(primary?.lastSalePrice);
    if (price === null) return null;
    const [low, high] = String(summary?.data?.summaryData?.TodayHighLow?.value ?? "").split("/").map(toNumber);
    const listed = resolveStock(ticker);
    const cleaned = String(info?.data?.companyName ?? "").replace(/\s+(Class [A-Z]\s+)?(Common|Ordinary)\s+(Stock|Shares).*$/i, "").trim();
    return {
      ticker,
      companyName: listed?.name || cleaned || ticker,
      price,
      dayChangePercent: toNumber(primary?.percentageChange),
      dayHigh: high ?? null,
      dayLow: low ?? null,
      volume: toNumber(summary?.data?.summaryData?.ShareVolume?.value),
      marketCap: toNumber(summary?.data?.summaryData?.MarketCap?.value) ?? (profiles as Record<string, { cap?: number }>)[ticker]?.cap ?? null,
    };
  } catch {
    return null;
  }
}

export async function getTickerSnapshots(tickers: string[]): Promise<Map<string, TickerSnapshot>> {
  const apiKey = process.env.FMP_API_KEY;
  const snapshots = new Map<string, TickerSnapshot>();
  if (!apiKey || tickers.length === 0) return snapshots;

  const unique = Array.from(new Set(tickers.map((ticker) => ticker.trim().toUpperCase())));

  const results = await Promise.all(
    unique.map(async (ticker) => {
      try {
        const response = await fetch(
          `${FMP_BASE_URL}/quote?symbol=${encodeURIComponent(ticker.replace(".", "-"))}&apikey=${apiKey}`,
          { cache: "no-store", headers: { Accept: "application/json" }, signal: AbortSignal.timeout(8000) },
        );
        // Plan restrictions come back as plain text, not JSON, so read the text and fall back to Nasdaq.
        const text = await response.text();
        let quote: FmpQuote | undefined;
        try {
          quote = (JSON.parse(text) as FmpQuote[])?.[0];
        } catch {
          quote = undefined;
        }
        if (!response.ok || !quote?.symbol) return nasdaqSnapshot(ticker);

        const snapshot: TickerSnapshot = {
          ticker,
          companyName: quote.name ?? ticker,
          price: numberOrNull(quote.price),
          dayChangePercent: numberOrNull(quote.changePercentage),
          dayHigh: numberOrNull(quote.dayHigh),
          dayLow: numberOrNull(quote.dayLow),
          volume: numberOrNull(quote.volume),
          marketCap: numberOrNull(quote.marketCap),
        };
        return snapshot;
      } catch {
        return nasdaqSnapshot(ticker);
      }
    }),
  );

  for (const snapshot of results) {
    if (snapshot) snapshots.set(snapshot.ticker, snapshot);
  }

  return snapshots;
}

function numberOrNull(value: number | null | undefined) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}
