// Picks the companies a stock competes with and gathers how they did, so the brief can say whether a move was this one
// company or its whole industry, and how its business compares. Peers come from our local profile list (same industry,
// biggest first); their prices come from Nasdaq's free quotes and their numbers from SEC filings, so no market data calls.
import profiles from "@/data/stock-profiles.json";
import { resolveStock } from "@/lib/stock-lookup";
import { getFundamentals } from "./fundamentals";
import { nasdaqSnapshot } from "./market-data";

type Profile = { sector?: string; industry?: string; cap?: number };
const PROFILES = profiles as Record<string, Profile>;

/** One competitor and how it compares. */
export type PeerFacts = {
  ticker: string;
  companyName: string;
  changePercent: number | null;
  revenueGrowthPercent: number | null;
  netMarginPercent: number | null;
};

// The first word of a company name, used to skip other share classes of the same company (GOOG and GOOGL).
const firstWord = (ticker: string) => (resolveStock(ticker)?.name ?? ticker).toLowerCase().split(/\s+/)[0];

// Hand picked rivals for the most followed stocks. The industry labels in our profile list come from two sources and
// don't always line up (Tesla would get Toyota, Ferrari and a truck maker), so popular names get the rivals people expect.
const RIVALS: Record<string, string[]> = {
  AAPL: ["MSFT", "GOOGL", "AMZN"], MSFT: ["GOOGL", "AMZN", "ORCL"], NVDA: ["AMD", "AVGO", "INTC"], AMZN: ["WMT", "MSFT", "GOOGL"],
  GOOGL: ["META", "MSFT", "AMZN"], GOOG: ["META", "MSFT", "AMZN"], META: ["GOOGL", "SNAP", "PINS"], TSLA: ["GM", "F", "RIVN"],
  AVGO: ["NVDA", "QCOM", "AMD"], AMD: ["NVDA", "INTC", "QCOM"], INTC: ["AMD", "NVDA", "QCOM"], QCOM: ["AVGO", "AMD", "INTC"],
  MU: ["WDC", "NVDA", "AMD"], NFLX: ["DIS", "WBD", "ROKU"], DIS: ["NFLX", "CMCSA", "WBD"], COST: ["WMT", "TGT", "BJ"],
  WMT: ["COST", "TGT", "AMZN"], TGT: ["WMT", "COST", "DG"], ADBE: ["CRM", "INTU", "NOW"], CRM: ["ORCL", "NOW", "ADBE"],
  ORCL: ["MSFT", "CRM", "SAP"], PLTR: ["SNOW", "CRM", "NOW"], SNOW: ["PLTR", "MDB", "DDOG"], JPM: ["BAC", "WFC", "C"],
  BAC: ["JPM", "WFC", "C"], WFC: ["JPM", "BAC", "C"], C: ["JPM", "BAC", "WFC"], GS: ["MS", "JPM", "SCHW"], MS: ["GS", "SCHW", "JPM"],
  V: ["MA", "AXP", "PYPL"], MA: ["V", "AXP", "PYPL"], PYPL: ["XYZ", "V", "MA"], SOFI: ["HOOD", "PYPL", "AFRM"], HOOD: ["SCHW", "COIN", "SOFI"],
  COIN: ["HOOD", "SCHW", "MSTR"], XOM: ["CVX", "COP", "OXY"], CVX: ["XOM", "COP", "OXY"], KO: ["PEP", "MNST", "KDP"],
  PEP: ["KO", "MNST", "KDP"], CELH: ["MNST", "KO", "PEP"], MNST: ["CELH", "KO", "PEP"], LLY: ["NVO", "MRK", "PFE"],
  JNJ: ["PFE", "MRK", "ABBV"], PFE: ["MRK", "JNJ", "BMY"], MRK: ["PFE", "LLY", "JNJ"], UBER: ["LYFT", "DASH", "ABNB"],
  LYFT: ["UBER", "DASH"], ABNB: ["BKNG", "EXPE", "UBER"], SBUX: ["MCD", "CMG", "DPZ"], MCD: ["SBUX", "CMG", "YUM"],
  NKE: ["LULU", "DECK", "ONON"], BA: ["LMT", "RTX", "GE"], RIVN: ["TSLA", "LCID", "GM"], SHOP: ["AMZN", "EBAY", "ETSY"],
  "BRK.B": ["JPM", "BAC", "MKL"], SPOT: ["NFLX", "SIRI"], RDDT: ["META", "SNAP", "PINS"], SMCI: ["DELL", "HPE", "NVDA"],
};

/** Up to `count` rivals: hand picked for popular stocks, otherwise the biggest listed companies in the same industry. */
export function pickPeers(ticker: string, count = 3): string[] {
  const picked = RIVALS[ticker]?.filter((symbol) => resolveStock(symbol));
  if (picked?.length) return picked.slice(0, count);
  const industry = PROFILES[ticker]?.industry;
  if (!industry) return [];
  const self = firstWord(ticker);
  return Object.entries(PROFILES)
    .filter(([symbol, profile]) => symbol !== ticker && profile.industry === industry && (profile.cap ?? 0) > 0 && resolveStock(symbol))
    .sort((a, b) => (b[1].cap ?? 0) - (a[1].cap ?? 0))
    .map(([symbol]) => symbol)
    .filter((symbol) => firstWord(symbol) !== self)
    .slice(0, count);
}

// Quotes and numbers are shared across every stock in one run, so a peer that several readers' stocks share is fetched once.
const quoteCache = new Map<string, Promise<Awaited<ReturnType<typeof nasdaqSnapshot>>>>();
function quote(ticker: string) {
  let pending = quoteCache.get(ticker);
  if (!pending) {
    pending = nasdaqSnapshot(ticker).catch(() => null);
    quoteCache.set(ticker, pending);
    // Prices go stale, so forget them after ten minutes.
    setTimeout(() => quoteCache.delete(ticker), 10 * 60 * 1000).unref?.();
  }
  return pending;
}

/** The peers of one stock with today's move and their latest growth and margin. Missing pieces are null. */
export async function getPeerFacts(ticker: string): Promise<PeerFacts[]> {
  const peers = pickPeers(ticker);
  const rows = await Promise.all(
    peers.map(async (symbol) => {
      const [snapshot, numbers] = await Promise.all([quote(symbol), getFundamentals(symbol)]);
      return {
        ticker: symbol,
        companyName: resolveStock(symbol)?.name ?? symbol,
        changePercent: snapshot?.dayChangePercent ?? null,
        revenueGrowthPercent: numbers?.revenueGrowthPercent ?? null,
        netMarginPercent: numbers?.netMarginPercent ?? null,
      };
    }),
  );
  // A peer with nothing to compare is just noise.
  return rows.filter((row) => row.changePercent !== null || row.revenueGrowthPercent !== null);
}
