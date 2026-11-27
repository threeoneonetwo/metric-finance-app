// Daily closing prices from Nasdaq's free price history (no key, no limit), used for the price charts and the homepage
// "biggest moves" strip. Each stock's history is cached for a few hours, so pages and crawlers don't refetch it.
import { unstable_cache } from "next/cache";

/** One trading day's close. */
export type DailyClose = { date: string; close: number };

const toNumber = (value: unknown) => {
  const parsed = Number(String(value ?? "").replace(/[$,\s]/g, ""));
  return String(value ?? "").trim() !== "" && Number.isFinite(parsed) ? parsed : null;
};

// Today in New York (YYYY-MM-DD) and whether the market is open right now, so a half finished day is never charted.
function newYorkNow() {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", year: "numeric", month: "2-digit", day: "2-digit", weekday: "short", hour: "2-digit", minute: "2-digit", hour12: false })
      .formatToParts(new Date())
      .map((part) => [part.type, part.value]),
  );
  const minutes = (Number(parts.hour) % 24) * 60 + Number(parts.minute);
  const weekend = parts.weekday === "Sat" || parts.weekday === "Sun";
  return { date: `${parts.year}-${parts.month}-${parts.day}`, trading: !weekend && minutes >= 570 && minutes < 960 };
}

async function fetchHistory(symbol: string, assetclass: "stocks" | "etf", days: number): Promise<DailyClose[]> {
  const from = new Date(Date.now() - (days + 10) * 86400000).toISOString().slice(0, 10);
  const response = await fetch(
    `https://api.nasdaq.com/api/quote/${encodeURIComponent(symbol.replace(".", "/"))}/historical?assetclass=${assetclass}&fromdate=${from}&limit=${days + 10}`,
    { cache: "no-store", headers: { Accept: "application/json", "User-Agent": "Mozilla/5.0" }, signal: AbortSignal.timeout(8000) },
  );
  if (!response.ok) throw new Error(`nasdaq history ${response.status}`);
  const data = (await response.json()) as { data?: { tradesTable?: { rows?: Record<string, string>[] } } | null };
  const now = newYorkNow();
  return (data.data?.tradesTable?.rows ?? [])
    .map((row) => {
      const [month, day, year] = String(row.date ?? "").split("/");
      return { date: `${year}-${month}-${day}`, close: toNumber(row.close) };
    })
    .filter((row): row is DailyClose => row.close !== null && /^\d{4}-\d{2}-\d{2}$/.test(row.date) && !(now.trading && row.date === now.date))
    .sort((a, b) => (a.date < b.date ? -1 : 1))
    .slice(-days);
}

// Stocks first, then funds (SPY, QQQ). An empty answer means Nasdaq has nothing; a network failure throws so it isn't cached.
async function load(symbol: string, days: number): Promise<DailyClose[]> {
  const stocks = await fetchHistory(symbol, "stocks", days);
  if (stocks.length >= 2) return stocks;
  const funds = await fetchHistory(symbol, "etf", days).catch(() => []);
  return funds.length >= 2 ? funds : stocks;
}

const cached = unstable_cache(load, ["price-history-v1"], { revalidate: 3 * 60 * 60 });

/** About `days` trading days of closes, oldest first. Empty when Nasdaq can't answer. */
export async function getPriceHistory(symbol: string, days = 30): Promise<DailyClose[]> {
  try {
    return await cached(symbol.toUpperCase(), days);
  } catch {
    return [];
  }
}

/** How each stock did on its last finished trading day, biggest moves first. Stocks without data are left out. */
export async function getLastMoves(symbols: string[]) {
  const rows = await Promise.all(
    symbols.map(async (symbol) => {
      const history = await getPriceHistory(symbol, 30);
      const [before, last] = history.slice(-2);
      if (!before || !last) return null;
      return { symbol, date: last.date, close: last.close, changePercent: ((last.close - before.close) / before.close) * 100, history };
    }),
  );
  return rows.filter((row) => row !== null).sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent));
}
