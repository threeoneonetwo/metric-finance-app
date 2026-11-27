import { BRIEF_TOOL_SCHEMA, validateBrief, type Brief } from "./brief-schema";
import type { BriefFacts } from "./brief-data";
import type { Fundamentals } from "./fundamentals";

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const MODEL = process.env.CLAUDE_MODEL ?? "claude-haiku-4-5";

const SYSTEM_PROMPT = `You write the Metric Finance daily brief for young adults who are new to investing. Write like a smart, warm friend: short sentences, plain words, a little playful, never cringe. No emojis. Never use dashes or hyphens anywhere: not as punctuation and not inside words (write "large scale", not "large-scale"). Write dates in words, like "November 2, 2026", never as 2026-11-02.

Hard rules:
- The subject is a plain specific headline for the email. The hook is the curiosity line for the dashboard: it teases the story without giving away the answer.
- Headlines carry a publishedAt time. Only stories from the last day are news; a stock with no recent headline has no news today, so say the reason is not clear yet instead of retelling an older story.
- Use ONLY the facts in the data provided. Never invent a reason for a move. If the headlines do not explain a move, say plainly that the reason is not clear yet.
- Never tell the reader to buy, sell or hold. No price targets, no predictions dressed up as facts.
- Explain any finance term in plain words the first time you use it.
- Every number, date and event must come from the data.
- The lead story is the single most material story across the reader's stocks: prefer a big move that headlines can explain over a small move.
- "Today in one sentence" must say whether the main move was one company, a sector, or the whole market, using the market change and the sector of each stock.
- The "rest" section must never retell the lead story. On a quiet day (move under about 0.7 percent and no relevant news) write one short line such as "Quiet day. Nothing material."
- The "idea" teaches exactly one concept that comes out of the lead story, and must make sense to someone who never saw the brief.
- "What to watch next": use the next earnings date and the analyst estimates in the data when present. If no dates exist, say what kind of event to watch without inventing one.
- "numbers": one entry per stock, in the order given. "business" reads that stock's latestReport in plain words: is it selling more than a year ago, how much of each dollar of sales it keeps as profit (explain margin simply, like "keeps 62 cents of every dollar"), and how its cash compares with its debt. Round big numbers ("about 96 billion dollars") and name the period ("the quarter that ended July 26"). If latestReport is null, write an empty string. "rivals" compares the stock with its rivals in the data: say whether today's move was just this company or the whole group, and how its sales growth and margin compare. If rivals is empty, write an empty string. Never call a company a good or bad investment.
- Word counts: one sentence 25 to 40 words. Lead about 150 words across its five parts. Each non quiet "rest" entry 25 to 40 words. Idea 40 to 60 words. Each "business" and "rivals" 20 to 40 words.`;

// Billions with two decimals, which the model rounds into plain words.
const billions = (value: number | null) => (value === null ? null : Number((value / 1e9).toFixed(2)));

// A company's latest report in the form the model reads best: words for the date, billions for money.
function reportFor(report: Fundamentals) {
  return {
    periodEnded: new Intl.DateTimeFormat("en-US", { timeZone: "UTC", month: "long", day: "numeric", year: "numeric" }).format(new Date(`${report.periodEnd}T00:00:00Z`)),
    revenueBillions: billions(report.revenue),
    revenueGrowthVsYearAgoPercent: report.revenueGrowthPercent,
    netIncomeBillions: billions(report.netIncome),
    netMarginPercent: report.netMarginPercent,
    operatingMarginPercent: report.operatingMarginPercent,
    cashBillions: billions(report.cash),
    debtBillions: billions(report.debt),
  };
}

function describe(facts: BriefFacts, tickers: string[]) {
  return {
    asOf: facts.asOf,
    marketChangePercentSP500: facts.marketChangePercent,
    stocks: tickers.map((ticker) => {
      const item = facts.tickers.get(ticker)!;
      return {
        ticker,
        company: item.companyName,
        sector: item.sector,
        industry: item.industry,
        price: item.price,
        changePercentToday: item.changePercent === null ? null : Number(item.changePercent.toFixed(2)),
        headlines: item.headlines.map((headline) => ({ title: headline.title, source: headline.source, publishedAt: headline.publishedAt })),
        nextEarnings: item.nextEarnings,
        latestReport: item.fundamentals ? reportFor(item.fundamentals) : null,
        rivals: (item.peers ?? []).map((peer) => ({ ticker: peer.ticker, company: peer.companyName, changePercentToday: peer.changePercent === null ? null : Number(peer.changePercent.toFixed(2)), revenueGrowthVsYearAgoPercent: peer.revenueGrowthPercent, netMarginPercent: peer.netMarginPercent })),
      };
    }),
  };
}

async function callModel(payload: unknown, apiKey: string, tickerCount: number) {
  const response = await fetch(ANTHROPIC_URL, {
    method: "POST",
    headers: { "content-type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({
      model: MODEL,
      // Room for every stock: IU readers can follow up to 15.
      max_tokens: 3400 + 330 * Math.max(0, tickerCount - 5),
      system: SYSTEM_PROMPT,
      tools: [{ name: "write_brief", description: "Write today's brief for this reader.", input_schema: BRIEF_TOOL_SCHEMA }],
      tool_choice: { type: "tool", name: "write_brief" },
      messages: [{ role: "user", content: `Write today's brief for this reader's stocks, in this order.\n\n${JSON.stringify(payload, null, 2)}` }],
    }),
    signal: AbortSignal.timeout(tickerCount > 5 ? 90000 : 45000),
  });

  if (!response.ok) {
    console.error(`write-brief: Anthropic ${response.status}: ${(await response.text()).slice(0, 300)}`);
    return null;
  }
  const data = (await response.json()) as { content?: Array<{ type: string; input?: unknown }> };
  return data.content?.find((block) => block.type === "tool_use")?.input ?? null;
}

export function hasBriefWriterConfig() {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

export async function writeBrief(facts: BriefFacts, wantedTickers: string[]): Promise<Brief | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const tickers = wantedTickers.filter((ticker) => facts.tickers.has(ticker));
  if (!apiKey || tickers.length === 0) return null;

  const payload = describe(facts, tickers);

  // One retry: a rare malformed answer should not cost a subscriber their brief.
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const raw = await callModel(payload, apiKey, tickers.length);
      if (!raw) return null;
      const checked = validateBrief(raw, tickers);
      if (checked.ok) return checked.brief;
      console.error(`write-brief: rejected output (${checked.reason}), attempt ${attempt + 1}`);
    } catch (error) {
      console.error("write-brief: request failed", error);
      return null;
    }
  }
  return null;
}
