import { BRIEF_TOOL_SCHEMA, validateBrief, type Brief } from "./brief-schema";
import type { BriefFacts } from "./brief-data";

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const MODEL = process.env.CLAUDE_MODEL ?? "claude-haiku-4-5";

const SYSTEM_PROMPT = `You write the Metric Finance daily brief for young adults who are new to investing. Write like a smart, warm friend: short sentences, plain words, a little playful, never cringe. No emojis. Do not use dashes as punctuation; use commas or full stops.

Hard rules:
- Use ONLY the facts in the data provided. Never invent a reason for a move. If the headlines do not explain a move, say plainly that the reason is not clear yet.
- Never tell the reader to buy, sell or hold. No price targets, no predictions dressed up as facts.
- Explain any finance term in plain words the first time you use it.
- Every number, date and event must come from the data.
- The lead story is the single most material story across the reader's stocks: prefer a big move that headlines can explain over a small move.
- "Today in one sentence" must say whether the main move was one company, a sector, or the whole market, using the market change and the sector of each stock.
- The "rest" section must never retell the lead story. On a quiet day (move under about 0.7 percent and no relevant news) write one short line such as "Quiet day. Nothing material."
- The "idea" teaches exactly one concept that comes out of the lead story, and must make sense to someone who never saw the brief.
- "What to watch next": use the next earnings date and the analyst estimates in the data when present. If no dates exist, say what kind of event to watch without inventing one.
- Word counts: one sentence 25 to 40 words. Lead about 150 words across its five parts. Each non quiet "rest" entry 25 to 40 words. Idea 40 to 60 words.`;

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
        headlines: item.headlines.map((headline) => ({ title: headline.title, source: headline.source })),
        nextEarnings: item.nextEarnings,
      };
    }),
  };
}

async function callModel(payload: unknown, apiKey: string) {
  const response = await fetch(ANTHROPIC_URL, {
    method: "POST",
    headers: { "content-type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 2400,
      system: SYSTEM_PROMPT,
      tools: [{ name: "write_brief", description: "Write today's brief for this reader.", input_schema: BRIEF_TOOL_SCHEMA }],
      tool_choice: { type: "tool", name: "write_brief" },
      messages: [{ role: "user", content: `Write today's brief for this reader's stocks, in this order.\n\n${JSON.stringify(payload, null, 2)}` }],
    }),
    signal: AbortSignal.timeout(45000),
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
      const raw = await callModel(payload, apiKey);
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
