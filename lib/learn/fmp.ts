// The few market data calls the Learn refresh makes. The data provider has a small daily call limit, so every
// call here is counted, and a "limit reached" answer stops the whole run instead of retrying.
const BASE = "https://financialmodelingprep.com/stable";

export class QuotaError extends Error {}

async function fmp<T>(path: string): Promise<T[]> {
  const key = process.env.FMP_API_KEY;
  if (!key) throw new QuotaError("No FMP key");
  const response = await fetch(`${BASE}/${path}${path.includes("?") ? "&" : "?"}apikey=${key}`, { cache: "no-store", signal: AbortSignal.timeout(10000) });
  const data = (await response.json()) as unknown;
  if (!Array.isArray(data)) {
    const message = JSON.stringify(data);
    if (/limit/i.test(message)) throw new QuotaError(message.slice(0, 120));
    return [];
  }
  return data as T[];
}

export type FmpProfile = {
  description: string | null;
  ceo: string | null;
  employees: number | null;
  city: string | null;
  state: string | null;
  country: string | null;
  ipoDate: string | null;
  sector: string | null;
  industry: string | null;
  marketCap: number | null;
  beta: number | null;
  lastDividend: number | null;
  isEtf: boolean;
};

const str = (value: unknown) => (typeof value === "string" && value.trim() ? value.trim() : null);
const num = (value: unknown) => (typeof value === "number" && Number.isFinite(value) ? value : null);

export async function fetchProfile(symbol: string): Promise<FmpProfile | null> {
  const [raw] = await fmp<Record<string, unknown>>(`profile?symbol=${encodeURIComponent(symbol.replace(".", "-"))}`);
  if (!raw) return null;
  const employees = Number(raw.fullTimeEmployees);
  return {
    description: str(raw.description),
    ceo: str(raw.ceo),
    employees: Number.isFinite(employees) && employees > 0 ? employees : null,
    city: str(raw.city),
    state: str(raw.state),
    country: str(raw.country),
    ipoDate: str(raw.ipoDate),
    sector: str(raw.sector),
    industry: str(raw.industry),
    marketCap: num(raw.marketCap),
    beta: num(raw.beta),
    lastDividend: num(raw.lastDividend),
    isEtf: raw.isEtf === true || raw.isFund === true,
  };
}

export type Move = { symbol: string; name: string; changePercent: number; price: number };

async function movers(path: string): Promise<Move[]> {
  const rows = await fmp<Record<string, unknown>>(path);
  return rows.flatMap((row) => {
    const symbol = str(row.symbol);
    const changePercent = num(row.changesPercentage) ?? num(row.changePercentage);
    const price = num(row.price);
    return symbol && changePercent !== null && price !== null ? [{ symbol, name: str(row.name) ?? symbol, changePercent, price }] : [];
  });
}

export const fetchGainers = () => movers("biggest-gainers");
export const fetchLosers = () => movers("biggest-losers");

export async function fetchIndexMoves(): Promise<{ symbol: string; label: string; changePercent: number }[]> {
  const out: { symbol: string; label: string; changePercent: number }[] = [];
  for (const [symbol, label] of [["SPY", "S&P 500"], ["QQQ", "Nasdaq 100"], ["DIA", "Dow Jones"]] as const) {
    const [row] = await fmp<Record<string, unknown>>(`quote?symbol=${symbol}`);
    const changePercent = num(row?.changePercentage);
    if (changePercent !== null) out.push({ symbol, label, changePercent });
  }
  return out;
}
