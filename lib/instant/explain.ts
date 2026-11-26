// The instant explainer: a short, one stock version of the daily brief that anyone can read without signing up.
// It is the "try it first" step on the homepage and on every Learn stock page.
//
// Cost control (the market data plan and the AI both cost money):
// - Results are kept in Next's data cache per stock and per time slot (two hours while the market is open, the rest of the
//   day after the close), so 500 people looking at NVDA cost one AI call and a few market data calls.
// - Only a fresh write counts toward a site wide daily cap (DAILY_FRESH_CAP). Cached answers are free.
// - The API route adds a per visitor limit, and the page only asks when someone clicks, so crawlers never trigger it.
import { unstable_cache } from "next/cache";
import { hitRateLimit } from "@/db/rate-limit";
import { gatherBriefFacts } from "@/lib/newsletter/brief-data";
import { resolveStock } from "@/lib/stock-lookup";

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const MODEL = process.env.INSTANT_MODEL ?? process.env.CLAUDE_MODEL ?? "claude-haiku-4-5";

/** Fresh explainers written per New York day across the whole site. Each one uses about 4 market data calls, and the
 * free market data plan allows about 250 a day that the 5 PM brief also needs, so keep this small until the plan is upgraded. */
export const DAILY_FRESH_CAP = Number(process.env.INSTANT_DAILY_CAP ?? 25);

// When the AI refuses (for example no credit), stop trying for a while so clicks don't burn market data calls for nothing.
let writerDownUntil = 0;

/** What the page shows. */
export type InstantExplainer = {
  symbol: string;
  company: string;
  price: number | null;
  changePercent: number | null;
  marketChangePercent: number | null;
  /** "open" while the market is trading, otherwise "closed". */
  session: "open" | "closed";
  /** Readable New York time the facts were collected, like "Thursday, November 26, 4:12 PM ET". */
  asOfLabel: string;
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

// New York clock parts, used for the cache slot and the labels.
function newYork(now = new Date()) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", year: "numeric", month: "2-digit", day: "2-digit", weekday: "short", hour: "2-digit", minute: "2-digit", hour12: false })
      .formatToParts(now)
      .map((part) => [part.type, part.value]),
  );
  const hour = Number(parts.hour) % 24;
  const minutes = hour * 60 + Number(parts.minute);
  const weekday = parts.weekday as string;
  const open = weekday !== "Sat" && weekday !== "Sun" && minutes >= 570 && minutes < 960;
  const date = `${parts.year}-${parts.month}-${parts.day}`;
  const label = new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", weekday: "long", month: "long", day: "numeric", hour: "numeric", minute: "2-digit" }).format(now);
  return { date, open, hour, label: `${label} ET` };
}

/** The cache slot for right now: every two hours while trading, one slot for the rest of the day otherwise. */
export function currentSlot(now = new Date()) {
  const ny = newYork(now);
  if (!ny.open) return `${ny.date}:${ny.hour < 9 ? "pre" : "closed"}`;
  return `${ny.date}:open${Math.floor(ny.hour / 2)}`;
}

const SYSTEM_PROMPT = `You explain one US stock to someone who is new to investing, like a smart, warm friend. Short sentences, plain words, a little playful, never cringe. No emojis. Never use dashes or hyphens anywhere: not as punctuation and not inside words (write "large scale", not "large-scale"). Write dates in words.

Hard rules:
- Use ONLY the facts provided. Never invent a reason for a move. If the headlines do not explain the move, say plainly that the reason is not clear yet.
- Headlines carry a publishedAt time. Only stories from the last day are news.
- The session field says whether the market is still open. If it is open, talk about the move "so far today". If it is closed on a weekday, talk about "today". If the facts are from an earlier trading day (a weekend or early morning), say "in the last trading session" instead of "today".
- Compare the stock's move with the S&P 500 move to say whether it was the company, its sector, or the whole market.
- Never tell the reader to buy, sell or hold. No price targets, no predictions.
- Explain any finance term in plain words the first time you use it.
- Every number and event must come from the data.`;

const TOOL_SCHEMA = {
  type: "object",
  properties: {
    headline: { type: "string", description: "A plain, specific, curiosity driven headline about this stock's move, max 60 characters. True to the data. No dashes, no emojis, no question marks." },
    oneLiner: { type: "string", description: "20 to 40 words. What the stock did and whether it was the company, a sector or the whole market." },
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
        tools: [{ name: "explain_stock", description: "Explain this stock's latest move.", input_schema: TOOL_SCHEMA }],
        tool_choice: { type: "tool", name: "explain_stock" },
        messages: [{ role: "user", content: `Explain this stock's latest move.\n\n${JSON.stringify(payload, null, 2)}` }],
      }),
      signal: AbortSignal.timeout(30000),
    });
    if (!response.ok) {
      if (response.status === 400 || response.status === 401 || response.status === 403 || response.status === 429 || response.status >= 500) writerDownUntil = Date.now() + 10 * 60 * 1000;
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

// Does the real work. Throws (so nothing is cached) when the cap is hit, the data is missing or the writer fails.
async function build(symbol: string): Promise<InstantExplainer> {
  const stock = resolveStock(symbol);
  if (!stock) throw new InstantError("unknown_stock");
  if (!process.env.ANTHROPIC_API_KEY || Date.now() < writerDownUntil) throw new InstantError("writer_failed");

  const ny = newYork();
  // Only fresh writes reach this point, so only they count toward the site wide cap.
  const { limited } = await hitRateLimit(`instant:fresh:${ny.date}`, DAILY_FRESH_CAP, 60 * 60 * 26).catch(() => ({ limited: false }));
  if (limited) throw new InstantError("busy");

  const facts = await gatherBriefFacts([stock.symbol]);
  const item = facts.tickers.get(stock.symbol);
  if (!item || item.price === null) throw new InstantError("no_data");

  const raw = await write({
    session: ny.open ? "open" : "closed",
    newYorkTimeNow: ny.label,
    marketChangePercentSP500: facts.marketChangePercent === null ? null : Number(facts.marketChangePercent.toFixed(2)),
    stock: {
      ticker: stock.symbol,
      company: item.companyName,
      sector: item.sector,
      industry: item.industry,
      price: item.price,
      changePercent: item.changePercent === null ? null : Number(item.changePercent.toFixed(2)),
      headlines: item.headlines.map((headline) => ({ title: headline.title, source: headline.source, publishedAt: headline.publishedAt })),
      nextEarnings: item.nextEarnings,
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

  return {
    symbol: stock.symbol,
    company: item.companyName || stock.name,
    price: item.price,
    changePercent: item.changePercent,
    marketChangePercent: facts.marketChangePercent,
    session: ny.open ? "open" : "closed",
    asOfLabel: ny.label,
    ...result,
  };
}

// One cached answer per stock and time slot. Errors are thrown, and thrown errors are never cached.
const cached = unstable_cache((symbol: string, slot: string) => { void slot; return build(symbol); }, ["instant-explainer-v1"], { revalidate: 60 * 60 * 24 });

/** The explainer for a stock right now, from the cache when someone already asked in this time slot. */
export function getInstantExplainer(symbol: string) {
  return cached(symbol.trim().toUpperCase(), currentSlot());
}
