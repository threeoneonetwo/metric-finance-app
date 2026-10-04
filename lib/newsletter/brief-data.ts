import { getTickerSnapshots } from "./market-data";
import { getTickerNews, type NewsHeadline } from "./news";

const FMP_BASE_URL = "https://financialmodelingprep.com/stable";

export type NextEarnings = {
  date: string;
  epsEstimated: number | null;
  revenueEstimated: number | null;
};

export type TickerFacts = {
  ticker: string;
  companyName: string;
  price: number | null;
  changePercent: number | null;
  sector: string | null;
  industry: string | null;
  headlines: NewsHeadline[];
  nextEarnings: NextEarnings | null;
};

export type BriefFacts = {
  asOf: string;
  marketChangePercent: number | null;
  tickers: Map<string, TickerFacts>;
};

async function fmpJson<T>(path: string): Promise<T | null> {
  const apiKey = process.env.FMP_API_KEY;
  if (!apiKey) return null;
  try {
    const response = await fetch(`${FMP_BASE_URL}/${path}${path.includes("?") ? "&" : "?"}apikey=${apiKey}`, {
      cache: "no-store",
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

function todayInEastern() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/New_York" }).format(new Date());
}

async function getNextEarnings(ticker: string): Promise<NextEarnings | null> {
  const rows = await fmpJson<Array<{ date?: string; epsActual?: number | null; epsEstimated?: number | null; revenueEstimated?: number | null }>>(
    `earnings?symbol=${encodeURIComponent(ticker.replace(".", "-"))}&limit=4`,
  );
  const today = todayInEastern();
  const upcoming = (rows ?? [])
    .filter((row) => row.date && row.date >= today && row.epsActual == null)
    .sort((a, b) => (a.date! < b.date! ? -1 : 1))[0];
  if (!upcoming?.date) return null;
  return {
    date: upcoming.date,
    epsEstimated: upcoming.epsEstimated ?? null,
    revenueEstimated: upcoming.revenueEstimated ?? null,
  };
}

async function getProfile(ticker: string) {
  const rows = await fmpJson<Array<{ sector?: string; industry?: string }>>(`profile?symbol=${encodeURIComponent(ticker.replace(".", "-"))}`);
  return { sector: rows?.[0]?.sector ?? null, industry: rows?.[0]?.industry ?? null };
}

export async function gatherBriefFacts(tickers: string[]): Promise<BriefFacts> {
  const unique = Array.from(new Set(tickers.map((ticker) => ticker.trim().toUpperCase())));
  const [snapshots, market] = await Promise.all([
    getTickerSnapshots(unique),
    fmpJson<Array<{ changePercentage?: number | null }>>("quote?symbol=SPY"),
  ]);

  const entries = await Promise.all(
    unique.map(async (ticker): Promise<TickerFacts | null> => {
      const snapshot = snapshots.get(ticker);
      if (!snapshot) return null;
      const [headlines, profile, nextEarnings] = await Promise.all([
        getTickerNews(snapshot.companyName, ticker),
        getProfile(ticker),
        getNextEarnings(ticker),
      ]);
      return {
        ticker,
        companyName: snapshot.companyName,
        price: snapshot.price,
        changePercent: snapshot.dayChangePercent,
        sector: profile.sector,
        industry: profile.industry,
        headlines,
        nextEarnings,
      };
    }),
  );

  const facts = new Map<string, TickerFacts>();
  for (const entry of entries) if (entry) facts.set(entry.ticker, entry);

  const spy = market?.[0]?.changePercentage;
  return {
    asOf: new Date().toISOString(),
    marketChangePercent: typeof spy === "number" && Number.isFinite(spy) ? spy : null,
    tickers: facts,
  };
}
