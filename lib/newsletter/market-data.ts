const FMP_BASE_URL = "https://financialmodelingprep.com/stable";

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
  changesPercentage?: number | null;
  dayLow?: number | null;
  dayHigh?: number | null;
  volume?: number | null;
  marketCap?: number | null;
};

export function hasFmpConfig() {
  return Boolean(process.env.FMP_API_KEY);
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
          `${FMP_BASE_URL}/quote?symbol=${encodeURIComponent(ticker)}&apikey=${apiKey}`,
          { cache: "no-store", headers: { Accept: "application/json" }, signal: AbortSignal.timeout(8000) },
        );
        if (!response.ok) return null;
        const data = (await response.json()) as FmpQuote[];
        const quote = data?.[0];
        if (!quote?.symbol) return null;

        const snapshot: TickerSnapshot = {
          ticker,
          companyName: quote.name ?? ticker,
          price: numberOrNull(quote.price),
          dayChangePercent: numberOrNull(quote.changesPercentage),
          dayHigh: numberOrNull(quote.dayHigh),
          dayLow: numberOrNull(quote.dayLow),
          volume: numberOrNull(quote.volume),
          marketCap: numberOrNull(quote.marketCap),
        };
        return snapshot;
      } catch {
        return null;
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
