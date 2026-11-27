// A company's latest reported numbers (sales, profit, cash and debt), read for free from the SEC's public filing data.
// No API key and no daily limit, so it doesn't touch the small market data allowance. The numbers only change when a company
// files a quarterly report, so each company's summary is cached for a few days and the big SEC file is never stored.
import { unstable_cache } from "next/cache";

// The SEC asks automated callers to identify themselves.
const SEC_HEADERS = { "User-Agent": "MetricFinance/1.0 (+https://metricfinance.app)", Accept: "application/json" };
const DAY = 24 * 60 * 60 * 1000;

/** The latest reported period for one company, plus a year earlier for comparison. All money is in US dollars. */
export type Fundamentals = {
  /** "quarter" or "year", and the day that period ended (YYYY-MM-DD). */
  period: "quarter" | "year";
  periodEnd: string;
  revenue: number;
  /** Revenue growth against the same period a year earlier, in percent. */
  revenueGrowthPercent: number | null;
  netIncome: number | null;
  /** Net income as a share of revenue, in percent. */
  netMarginPercent: number | null;
  /** Operating income as a share of revenue, in percent. */
  operatingMarginPercent: number | null;
  cash: number | null;
  debt: number | null;
  /** The day the cash and debt figures were measured. */
  balanceDate: string | null;
};

type Fact = { start?: string; end: string; val: number; form?: string };
type CompanyFacts = { facts?: { "us-gaap"?: Record<string, { units?: { USD?: Fact[] } }> } };

const days = (start: string, end: string) => (Date.parse(end) - Date.parse(start)) / DAY;
const round1 = (value: number) => Math.round(value * 10) / 10;

// Finds a stock's SEC id (CIK) through EDGAR's company search. Network failures throw, so they are never cached as "no data".
async function findCik(ticker: string): Promise<string | null> {
  const symbol = ticker.replace(".", "-").toUpperCase();
  const response = await fetch(`https://efts.sec.gov/LATEST/search-index?keysTyped=${encodeURIComponent(symbol)}`, {
    headers: SEC_HEADERS,
    cache: "no-store",
    signal: AbortSignal.timeout(6000),
  });
  if (!response.ok) throw new Error(`sec search ${response.status}`);
  const data = (await response.json()) as { hits?: { hits?: Array<{ _id?: string; _source?: { tickers?: string } }> } };
  const hit = data.hits?.hits?.find((row) => String(row._source?.tickers ?? "").split(/[,\s]+/).map((t) => t.toUpperCase()).includes(symbol));
  return hit?._id && /^\d+$/.test(hit._id) ? hit._id.padStart(10, "0") : null;
}

// Every value for one measure, de-duplicated by period, from the first tag the company actually uses.
function series(facts: CompanyFacts, tags: string[]): Fact[][] {
  const gaap = facts.facts?.["us-gaap"] ?? {};
  return tags.map((tag) => gaap[tag]?.units?.USD ?? []).filter((rows) => rows.length > 0);
}

// Quarterly values (about 3 months long) keyed by end date. A fourth quarter, which companies only report inside their yearly
// total, is worked out as the year minus the first nine months.
function quarters(rows: Fact[]): Map<string, number> {
  const out = new Map<string, number>();
  for (const row of rows) {
    if (row.start && days(row.start, row.end) >= 80 && days(row.start, row.end) <= 100) out.set(row.end, row.val);
  }
  for (const year of rows) {
    if (!year.start || days(year.start, year.end) < 350 || days(year.start, year.end) > 380 || out.has(year.end)) continue;
    const nineMonths = rows.find((row) => row.start === year.start && row.end < year.end && days(row.start!, row.end) >= 260 && days(row.start!, row.end) <= 285);
    if (nineMonths) out.set(year.end, year.val - nineMonths.val);
  }
  return out;
}

// The value for the period ending about a year before `end`.
function yearEarlier(values: Map<string, number>, end: string) {
  for (const [date, value] of values) {
    const gap = days(date, end);
    if (gap >= 350 && gap <= 380) return value;
  }
  return null;
}

// The newest point in time value (cash, debt) across the given tags. Companies switch tags over the years, so an old tag
// can hold a value from long ago; anything more than 15 months older than the latest report is ignored.
function latestInstant(groups: Fact[][], reportEnd: string): { val: number; end: string } | null {
  let best: { val: number; end: string } | null = null;
  for (const rows of groups) {
    for (const row of rows) if (!row.start && (!best || row.end > best.end)) best = { val: row.val, end: row.end };
  }
  return best && days(best.end, reportEnd) <= 456 ? best : null;
}

/** Turns the SEC's company facts into the short summary the brief uses. Exported for tests. */
export function summarize(facts: CompanyFacts): Fundamentals | null {
  // Companies tag sales differently (banks report revenue net of interest expense), so use whichever tag has the newest quarter.
  const revenueGroups = series(facts, ["Revenues", "RevenueFromContractWithCustomerExcludingAssessedTax", "SalesRevenueNet", "RevenuesNetOfInterestExpense", "RevenueFromContractWithCustomerIncludingAssessedTax"]);
  let revenue: Map<string, number> | null = null;
  let latest = "";
  for (const rows of revenueGroups) {
    const q = quarters(rows);
    const end = Array.from(q.keys()).sort().pop() ?? "";
    if (end > latest) {
      latest = end;
      revenue = q;
    }
  }
  // Nothing in the last 15 months means the filings are stale (or the company reports another way); better to say nothing.
  if (!revenue || !latest || Date.now() - Date.parse(latest) > 456 * DAY) return null;
  const sales = revenue.get(latest)!;
  if (!(sales > 0)) return null;

  const pick = (tags: string[]) => {
    for (const rows of series(facts, tags)) {
      const value = quarters(rows).get(latest);
      if (value !== undefined) return value;
    }
    return null;
  };
  const netIncome = pick(["NetIncomeLoss", "ProfitLoss", "NetIncomeLossAvailableToCommonStockholdersBasic"]);
  const operatingIncome = pick(["OperatingIncomeLoss"]);
  const before = yearEarlier(revenue, latest);

  const cash = latestInstant(series(facts, ["CashAndCashEquivalentsAtCarryingValue", "CashCashEquivalentsRestrictedCashAndRestrictedCashEquivalents", "Cash"]), latest);
  const totalDebt = latestInstant(series(facts, ["LongTermDebt", "DebtInstrumentCarryingAmount"]), latest);
  let debt = totalDebt?.val ?? null;
  if (debt === null) {
    const longPart = latestInstant(series(facts, ["LongTermDebtNoncurrent"]), latest);
    const shortPart = latestInstant(series(facts, ["LongTermDebtCurrent", "DebtCurrent"]), latest);
    if (longPart) debt = longPart.val + (shortPart && shortPart.end === longPart.end ? shortPart.val : 0);
  }

  return {
    period: "quarter",
    periodEnd: latest,
    revenue: sales,
    revenueGrowthPercent: before && before > 0 ? round1(((sales - before) / before) * 100) : null,
    netIncome,
    netMarginPercent: netIncome === null ? null : round1((netIncome / sales) * 100),
    operatingMarginPercent: operatingIncome === null ? null : round1((operatingIncome / sales) * 100),
    cash: cash?.val ?? null,
    debt,
    balanceDate: cash?.end ?? null,
  };
}

// Downloads the SEC file for one company and keeps only the summary (the file itself is several megabytes).
// A company the SEC has no file for (most funds) is a real "no data" and is cached; a failed download throws and is retried next time.
async function load(ticker: string): Promise<Fundamentals | null> {
  const cik = await findCik(ticker);
  if (!cik) return null;
  const response = await fetch(`https://data.sec.gov/api/xbrl/companyfacts/CIK${cik}.json`, {
    headers: SEC_HEADERS,
    cache: "no-store",
    signal: AbortSignal.timeout(15000),
  });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`sec facts ${response.status}`);
  return summarize((await response.json()) as CompanyFacts);
}

// Cached for three days per company: quarterly numbers barely change, and the SEC asks callers to go easy.
const cached = unstable_cache(load, ["sec-fundamentals-v1"], { revalidate: 3 * 24 * 60 * 60 });

// The SEC allows about 10 requests a second, so at most four companies are fetched at once.
let running = 0;
const waiting: Array<() => void> = [];
async function limited<T>(task: () => Promise<T>): Promise<T> {
  if (running >= 4) await new Promise<void>((resolve) => waiting.push(resolve));
  running += 1;
  try {
    return await task();
  } finally {
    running -= 1;
    waiting.shift()?.();
  }
}

/** The latest reported numbers for a US listed company, or null for funds, foreign filers and anything the SEC data can't answer. */
export async function getFundamentals(ticker: string): Promise<Fundamentals | null> {
  try {
    const symbol = ticker.toUpperCase();
    // Outside the running site (a script) there is no cache to use, so it reads the SEC directly.
    return await limited(() => cached(symbol).catch((error) => (String(error).includes("incrementalCache") ? load(symbol) : Promise.reject(error))));
  } catch {
    return null;
  }
}
