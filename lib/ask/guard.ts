import { US_STOCKS } from "@/lib/stock-lookup";

/** Questions a reader can send to the model per New York day. Instant policy replies do not count. */
export const DAILY_QUESTIONS = 5;

// Cheap, deterministic checks that run before any model call. They catch the two things we must never answer
// (personal investment advice and stocks outside the reader's watchlist) without spending tokens or trusting the model.

export type GuardResult =
  | { ok: true }
  | { ok: false; reason: "advice" }
  | { ok: false; reason: "outside_watchlist"; symbols: string[] };

const ADVICE_PATTERNS = [
  /\bshould\s+i\s+(buy|sell|hold|keep|dump|short|invest|get\s+(in|out)|add|trim|average\s+down|take\s+profits?)\b/,
  /\b(is|was)\s+(it|this|now|\w+)\s+(a\s+)?(good|bad|smart|great)\s+(time\s+to\s+(buy|sell|invest)|buy|investment|stock\s+to\s+buy)\b/,
  /\b(worth|time\s+to)\s+(buying|selling|investing)\b/,
  /\b(buy|sell|hold)\s+(or|vs\.?)\s+(sell|hold|buy)\b/,
  /\bprice\s+target\b/,
  /\bwhere\s+will\s+.+\s+(be|trade|go)\b/,
  /\bwill\s+(it|this|the\s+stock|the\s+price|shares?|\$?[a-z]{1,5})\s+(go\s+up|go\s+down|rise|fall|drop|crash|recover|rebound|moon|double|bounce)\b/,
  /\b(predict|forecast)\s+(the\s+)?(price|stock|share)/,
  /\bhow\s+(much|high|low)\s+will\b/,
  /\b(how\s+much|what\s+percent(age)?)\s+(of\s+my\s+(money|portfolio|savings))\b/,
  /\bshould\s+i\s+put\b/,
];

// Upper case words that look like tickers but are ordinary finance vocabulary.
const NOT_TICKERS = new Set([
  "I", "A", "AI", "CEO", "CFO", "CTO", "EPS", "ETF", "IPO", "GDP", "CPI", "PPI", "FED", "FOMC", "SEC", "USA", "US", "UK", "EU",
  "PE", "P", "E", "Q", "Q1", "Q2", "Q3", "Q4", "YOY", "QOQ", "TTM", "EBIT", "EBITDA", "ROE", "ROI", "FCF", "DCF", "IRA", "LLC",
  "NYSE", "NASDAQ", "SP", "DOW", "VIX", "OK", "TV", "PC", "AM", "PM", "ET", "EST", "EDT", "ATH", "YTD", "ESG", "API", "IT", "HR",
  "LOL", "FAQ", "USD", "EV", "EVS", "GPU", "CPU", "AR", "VR", "M", "B", "K", "T", "NO", "YES", "ALL", "ANY", "WHY", "HOW", "WHAT",
]);
const KNOWN = new Set(US_STOCKS.map((stock) => stock.symbol));

export function normalizeQuestion(raw: string) {
  return raw.replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim();
}

/** Tickers named explicitly in the question: $XYZ anywhere, or an upper case word that is a real US listed symbol. */
export function explicitTickers(question: string): string[] {
  const found = new Set<string>();
  for (const match of question.matchAll(/\$([A-Za-z]{1,5}(?:\.[A-Za-z])?)\b/g)) found.add(match[1].toUpperCase());
  for (const match of question.matchAll(/\b([A-Z]{2,5}(?:\.[A-Z])?)\b/g)) {
    if (!NOT_TICKERS.has(match[1]) && KNOWN.has(match[1])) found.add(match[1]);
  }
  return [...found].filter((symbol) => KNOWN.has(symbol));
}

export function guardQuestion(question: string, watchlist: string[]): GuardResult {
  const lower = question.toLowerCase();
  if (ADVICE_PATTERNS.some((pattern) => pattern.test(lower))) return { ok: false, reason: "advice" };
  const outside = explicitTickers(question).filter((symbol) => !watchlist.includes(symbol));
  if (outside.length > 0) return { ok: false, reason: "outside_watchlist", symbols: outside };
  return { ok: true };
}

export function adviceReply() {
  return "I can't tell you whether to buy, sell or hold, or where a price is heading. What I can do is explain what happened, what the numbers mean and what to watch next, so the decision stays yours. Try asking why a stock moved or what a term in your brief means.";
}

export function outsideReply(symbols: string[], watchlist: string[]) {
  const names = symbols.slice(0, 3).join(", ");
  const yours = watchlist.join(", ");
  return `I can only answer questions about the stocks in this brief (${yours}). ${names} ${symbols.length === 1 ? "isn't" : "aren't"} in your watchlist. You can add up to five stocks from your dashboard, and they will show up in your next brief.`;
}

export function scopeReply(watchlist: string[], aboutAnotherStock: boolean) {
  const yours = watchlist.join(", ");
  return aboutAnotherStock
    ? `I can only answer questions about the stocks in this brief (${yours}). To follow another company, add it from your dashboard and it will appear in your next brief.`
    : `I can only help with questions about this brief and the stocks in it (${yours}). Try asking why one of them moved, or what a term in the brief means.`;
}
