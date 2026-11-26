// The instant explainer: anyone can search a stock and read, in plain words, what happened to it at the last close and why.
// It is the homepage hero and sits on every Learn stock page. No signup needed.
//
// Where the facts come from (all free, so it never touches the paid market data allowance the 5 PM brief needs):
// - Daily closes from Nasdaq's public price history (the paid provider is only a fallback).
// - The S&P 500 move from the same history for SPY, a fund that tracks it.
// - Sector and industry from our local profile list, headlines from Google News.
//
// Cost control: one AI write per stock per trading session, kept in Next's data cache, so 500 people looking at NVDA
// after Tuesday's close cost one AI call. Only fresh writes count toward a site wide daily cap (DAILY_FRESH_CAP), the API
// route adds a per visitor limit, and pages only ask when someone clicks, so crawlers never trigger it.
import { unstable_cache } from "next/cache";
import profiles from "@/data/stock-profiles.json";
import { hitRateLimit } from "@/db/rate-limit";
import { saveWhyPage } from "@/db/why";
import { resolveStock } from "@/lib/stock-lookup";

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const MODEL = process.env.INSTANT_MODEL ?? process.env.CLAUDE_MODEL ?? "claude-haiku-4-5";

/** Fresh explainers written per New York day across the whole site (each is one small AI call). */
export const DAILY_FRESH_CAP = Number(process.env.INSTANT_DAILY_CAP ?? 150);

// When the AI refuses (for example no credit), stop trying for a while so every click doesn't wait on a failing call.
let writerDownUntil = 0;

/** What the page shows. */
export type InstantExplainer = {
  symbol: string;
  company: string;
  exchange: string;
  /** The trading day this is about, as 2026-11-25 (used in the page address) and as "Tuesday, November 25". */
  sessionDate: string;
  sessionLabel: string;
  close: number;
  previousClose: number | null;
  changePercent: number | null;
  marketChangePercent: number | null;
  headline: string;
  oneLiner: string;
  whatHappened: string;
  whyItMatters: string;
  whatItDoesntProve: string;
  idea: { term: string; explanation: string };
};

/** Why an explainer could not be made. */
export class InstantError extends Error {
  constructor(public code: "unknown_stock" | "no_data" | "busy" | "writer_failed") {
    super(code);
  }
}

// One finished trading day.
type Session = { date: string; close: number; previousClose: number | null; changePercent: number | null; high: number | null; low: number | null; volume: number | null };

const toNumber = (value: unknown) => {
  const parsed = Number(String(value ?? "").replace(/[$,\s]/g, ""));
  return String(value ?? "").trim() !== "" && Number.isFinite(parsed) ? parsed : null;
};

// Today's date in New York (YYYY-MM-DD) and whether the market is trading right now.
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

// "2026-11-25" as "Tuesday, November 25".
const sessionLabel = (date: string) =>
  new Intl.DateTimeFormat("en-US", { timeZone: "UTC", weekday: "long", month: "long", day: "numeric" }).format(new Date(`${date}T12:00:00Z`));

// Builds a session from a list of daily closes, newest first. While the market is open today's partial row is skipped,
// so the explainer is always about a finished day.
function toSession(rows: { date: string; close: number | null; high?: number | null; low?: number | null; volume?: number | null }[]): Session | null {
  const today = newYorkNow();
  const days = rows.filter((row) => row.close !== null && !(today.trading && row.date === today.date));
  const [last, before] = days;
  if (!last || last.close === null) return null;
  const previousClose = before?.close ?? null;
  return {
    date: last.date,
    close: last.close,
    previousClose,
    changePercent: previousClose ? ((last.close - previousClose) / previousClose) * 100 : null,
    high: last.high ?? null,
    low: last.low ?? null,
    volume: last.volume ?? null,
  };
}

// The last finished session for a stock or fund, from Nasdaq's free price history, falling back to the paid provider.
async function lastSession(symbol: string, assetclass: "stocks" | "etf"): Promise<Session | null> {
  const from = new Date(Date.now() - 14 * 86400000).toISOString().slice(0, 10);
  try {
    const response = await fetch(`https://api.nasdaq.com/api/quote/${encodeURIComponent(symbol)}/historical?assetclass=${assetclass}&fromdate=${from}&limit=10`, {
      cache: "no-store",
      headers: { Accept: "application/json", "User-Agent": "Mozilla/5.0" }, // Nasdaq stalls unfamiliar user agents
      signal: AbortSignal.timeout(8000),
    });
    const data = (await response.json()) as { data?: { tradesTable?: { rows?: Record<string, string>[] } } };
    const rows = (data.data?.tradesTable?.rows ?? []).map((row) => {
      const [month, day, year] = String(row.date ?? "").split("/");
      return { date: `${year}-${month}-${day}`, close: toNumber(row.close), high: toNumber(row.high), low: toNumber(row.low), volume: toNumber(row.volume) };
    });
    const session = toSession(rows);
    if (session) return session;
  } catch {
    // Fall through to the provider.
  }
  const apiKey = process.env.FMP_API_KEY;
  if (!apiKey) return null;
  try {
    const response = await fetch(`https://financialmodelingprep.com/stable/historical-price-eod/light?symbol=${encodeURIComponent(symbol.replace(".", "-"))}&limit=5&apikey=${apiKey}`, {
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    const rows = (await response.json()) as { date?: string; price?: number; volume?: number }[];
    return Array.isArray(rows) ? toSession(rows.map((row) => ({ date: String(row.date), close: toNumber(row.price), volume: toNumber(row.volume) }))) : null;
  } catch {
    return null;
  }
}

// Recent headlines with their publish time, from Google News (free).
async function headlines(company: string, symbol: string) {
  try {
    const query = encodeURIComponent(`"${company}" OR ${symbol} stock when:4d`);
    const response = await fetch(`https://news.google.com/rss/search?q=${query}&hl=en-US&gl=US&ceid=US:en`, { cache: "no-store", signal: AbortSignal.timeout(6000) });
    if (!response.ok) return [];
    const decode = (text: string) => text.replace(/<!\[CDATA\[|\]\]>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'");
    return ((await response.text()).match(/<item>[\s\S]*?<\/item>/g) ?? [])
      .map((item) => {
        const raw = decode(item.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? "");
        const split = raw.lastIndexOf(" - ");
        const time = Date.parse(item.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1] ?? "");
        return { title: (split > 0 ? raw.slice(0, split) : raw).trim(), source: split > 0 ? raw.slice(split + 3).trim() : null, publishedAt: Number.isNaN(time) ? null : new Date(time).toISOString() };
      })
      .filter((headline) => headline.title && headline.publishedAt)
      .sort((a, b) => Date.parse(b.publishedAt!) - Date.parse(a.publishedAt!))
      .slice(0, 6);
  } catch {
    return [];
  }
}

const SYSTEM_PROMPT = `You explain one US stock to someone who is new to investing, like a smart, warm friend. Short sentences, plain words, a little playful, never cringe. No emojis. Never use dashes or hyphens anywhere: not as punctuation and not inside words (write "large scale", not "large-scale"). Write dates in words.

You are explaining one finished trading session, named in the data (for example "Tuesday, November 25"). Talk about that day by name or as "at the close", never as "today" unless the session date is today.

Hard rules:
- Use ONLY the facts provided. Never invent a reason for a move. If the headlines do not explain the move, say plainly that the reason is not clear yet.
- Headlines carry a publishedAt time. Only stories from around the session (the day before through the day after) can explain it.
- Compare the stock's move with the S&P 500 move to say whether it was the company, its sector, or the whole market.
- Never tell the reader to buy, sell or hold. No price targets, no predictions.
- Explain any finance term in plain words the first time you use it.
- Every number and event must come from the data.`;

const TOOL_SCHEMA = {
  type: "object",
  properties: {
    headline: { type: "string", description: "A plain, specific, curiosity driven headline about this stock's move at the close, max 60 characters. True to the data. No dashes, no emojis, no question marks." },
    oneLiner: { type: "string", description: "20 to 40 words. What the stock did at the close and whether it was the company, a sector or the whole market." },
    whatHappened: { type: "string", description: "30 to 60 words. The move and the clearest reason from the headlines, or say the reason is not clear yet." },
    whyItMatters: { type: "string", description: "30 to 60 words, simple words, may use one everyday analogy." },
    whatItDoesntProve: { type: "string", description: "15 to 40 words. What a reader should not conclude from one day." },
    idea: {
      type: "object",
      properties: {
        term: { type: "string", description: "One finance concept from the story, 1 to 3 words." },
        explanation: { type: "string", description: "25 to 50 words, makes sense on its own." },
      },
      required: ["term", "explanation"],
    },
  },
  required: ["headline", "oneLiner", "whatHappened", "whyItMatters", "whatItDoesntProve", "idea"],
} as const;

// Removes dashes the model may still slip in, and squeezes spaces.
function clean(text: unknown) {
  return typeof text === "string" ? text.replace(/\s*[–—]\s*/g, ", ").replace(/(\w)-(\w)/g, "$1 $2").replace(/\s+/g, " ").trim() : "";
}

// Asks the model for the explainer through a forced tool call. Returns null on any failure.
async function write(payload: unknown) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;
  try {
    const response = await fetch(ANTHROPIC_URL, {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 900,
        system: SYSTEM_PROMPT,
        tools: [{ name: "explain_stock", description: "Explain this stock's move at the last close.", input_schema: TOOL_SCHEMA }],
        tool_choice: { type: "tool", name: "explain_stock" },
        messages: [{ role: "user", content: `Explain this stock's move at the last close.\n\n${JSON.stringify(payload, null, 2)}` }],
      }),
      signal: AbortSignal.timeout(30000),
    });
    if (!response.ok) {
      if ([400, 401, 403, 429].includes(response.status) || response.status >= 500) writerDownUntil = Date.now() + 10 * 60 * 1000;
      console.error(`instant: Anthropic ${response.status}: ${(await response.text()).slice(0, 200)}`);
      return null;
    }
    const data = (await response.json()) as { content?: Array<{ type: string; input?: unknown }> };
    return (data.content?.find((block) => block.type === "tool_use")?.input ?? null) as Record<string, unknown> | null;
  } catch (error) {
    console.error("instant: request failed", error instanceof Error ? error.message : error);
    return null;
  }
}

// Writes the explainer for one stock and one session. Throws (so nothing is cached) when the cap is hit or the writer fails.
async function build(symbol: string, sessionDate: string): Promise<InstantExplainer> {
  const stock = resolveStock(symbol);
  if (!stock) throw new InstantError("unknown_stock");
  if (!process.env.ANTHROPIC_API_KEY || Date.now() < writerDownUntil) throw new InstantError("writer_failed");

  // Only fresh writes reach this point, so only they count toward the site wide cap.
  const { limited } = await hitRateLimit(`instant:fresh:${newYorkNow().date}`, DAILY_FRESH_CAP, 60 * 60 * 26).catch(() => ({ limited: false }));
  if (limited) throw new InstantError("busy");

  const [session, market, news] = await Promise.all([lastSession(stock.symbol, "stocks"), lastSession("SPY", "etf"), headlines(stock.name, stock.symbol)]);
  if (!session || session.date !== sessionDate) throw new InstantError("no_data");
  const profile = (profiles as Record<string, { sector?: string; industry?: string }>)[stock.symbol];
  const marketChange = market && market.date === session.date ? market.changePercent : null;
  const round = (value: number | null) => (value === null ? null : Number(value.toFixed(2)));

  const raw = await write({
    session: sessionLabel(session.date),
    todayInNewYork: sessionLabel(newYorkNow().date),
    marketChangePercentSP500: round(marketChange),
    stock: {
      ticker: stock.symbol,
      company: stock.name,
      sector: profile?.sector ?? null,
      industry: profile?.industry ?? null,
      close: session.close,
      previousClose: session.previousClose,
      changePercent: round(session.changePercent),
      dayHigh: session.high,
      dayLow: session.low,
      volume: session.volume,
      headlines: news,
    },
  });
  const idea = (raw?.idea ?? {}) as Record<string, unknown>;
  const result = {
    headline: clean(raw?.headline).slice(0, 80),
    oneLiner: clean(raw?.oneLiner),
    whatHappened: clean(raw?.whatHappened),
    whyItMatters: clean(raw?.whyItMatters),
    whatItDoesntProve: clean(raw?.whatItDoesntProve),
    idea: { term: clean(idea.term), explanation: clean(idea.explanation) },
  };
  if (!result.headline || !result.oneLiner || !result.whatHappened || !result.whyItMatters || !result.idea.term) throw new InstantError("writer_failed");

  const explainer: InstantExplainer = {
    symbol: stock.symbol,
    company: stock.name,
    exchange: stock.exchange,
    sessionDate: session.date,
    sessionLabel: sessionLabel(session.date),
    close: session.close,
    previousClose: session.previousClose,
    changePercent: session.changePercent,
    marketChangePercent: marketChange,
    ...result,
  };
  return explainer;
}

// One cached answer per stock and session. Thrown errors are never cached.
const cached = unstable_cache(build, ["instant-explainer-v3"], { revalidate: 60 * 60 * 24 * 7 });

/** The explainer for a stock's last finished session, from the cache when someone already asked about that session. */
export async function getInstantExplainer(symbol: string) {
  const stock = resolveStock(symbol);
  if (!stock) throw new InstantError("unknown_stock");
  // Finding the latest session is free (Nasdaq), so it runs every time and decides which cached answer to use.
  const session = await lastSession(stock.symbol, "stocks");
  if (!session) throw new InstantError("no_data");
  const explainer = await cached(stock.symbol, session.date);
  // Every explainer also becomes its own page (/why/[symbol]/[date]). This runs outside the cache so it can refresh the
  // page lists; the first save wins and later ones do nothing. A failed save never costs the reader their answer.
  const key = `${explainer.symbol}:${explainer.sessionDate}`;
  if (!savedThisInstance.has(key)) {
    savedThisInstance.add(key);
    await saveWhyPage(explainer).catch((error) => console.error("instant: could not save page", error instanceof Error ? error.message : error));
  }
  return explainer;
}

// Explainers this server instance has already saved, so repeat views don't write to the database again.
const savedThisInstance = new Set<string>();
