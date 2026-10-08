import type { LearnSection, LearnStockContent, LearnStockFacts } from "@/db/schema";
import { writeWithTool } from "./claude";
import type { FmpProfile, Move } from "./fmp";
import type { Headline } from "./news";
import type { Topic } from "./topics";
import { TERMS } from "./terms";

const stringList = (description: string, min: number, max: number) => ({ type: "array", description, minItems: min, maxItems: max, items: { type: "string" } });

const SECTIONS_SCHEMA = {
  type: "array",
  minItems: 3,
  maxItems: 6,
  items: {
    type: "object",
    properties: { heading: { type: "string" }, paragraphs: { type: "array", minItems: 1, maxItems: 3, items: { type: "string" } } },
    required: ["heading", "paragraphs"],
  },
};

export async function writeStockPage(input: {
  symbol: string;
  name: string;
  exchange: string;
  sector: string | null;
  industry: string | null;
  profile: FmpProfile | null;
}): Promise<{ content: LearnStockContent; facts: LearnStockFacts } | null> {
  const { profile } = input;
  const headquarters = profile ? [profile.city, profile.state, profile.country].filter(Boolean).join(", ") || null : null;
  const facts: LearnStockFacts = {
    ceo: profile?.ceo ?? null,
    employees: profile?.employees ?? null,
    headquarters,
    listedSince: profile?.ipoDate ? profile.ipoDate.slice(0, 4) : null,
    dividendPerShare: profile?.lastDividend && profile.lastDividend > 0 ? profile.lastDividend : null,
    beta: profile?.beta ?? null,
  };
  const result = await writeWithTool<LearnStockContent>({
    tool: "write_stock_guide",
    description: "Write the Metric Finance guide page for one stock.",
    maxTokens: 2200,
    schema: {
      type: "object",
      properties: {
        simple: { type: "string", description: "2 to 3 sentences, 45 to 70 words. What the company does, like you're 5, with at least two real product or business details from the facts." },
        makesMoney: stringList("3 or 4 bullets about how it makes money. Name its real products, segments or revenue sources. Each 15 to 30 words.", 3, 4),
        movesStock: stringList("3 or 4 bullets about what usually moves this particular stock. Specific to this business, not generic. Each 15 to 30 words.", 3, 4),
        goodToKnow: stringList("2 to 4 short facts a curious beginner would like, drawn only from the facts provided (leader, size, headquarters, history, dividend, how bumpy the stock has been). Each 10 to 25 words.", 2, 4),
        faqs: {
          type: "array",
          minItems: 3,
          maxItems: 4,
          description: "Questions real people type into Google about this stock, each answered in 25 to 60 words. Examples: does it pay a dividend, who runs it, where is it based, is it a big company, what does it sell.",
          items: { type: "object", properties: { q: { type: "string" }, a: { type: "string" } }, required: ["q", "a"] },
        },
      },
      required: ["simple", "makesMoney", "movesStock", "goodToKnow", "faqs"],
    },
    prompt: `Write the guide for this stock.\n\n${JSON.stringify({
      company: input.name,
      ticker: input.symbol,
      exchange: input.exchange,
      sector: input.sector ?? profile?.sector,
      industry: input.industry ?? profile?.industry,
      companyDescription: profile?.description,
      ceo: facts.ceo,
      employees: facts.employees,
      headquarters,
      listedSinceYear: facts.listedSince,
      lastDividendPerShare: facts.dividendPerShare,
      beta: facts.beta,
      marketCapDollars: profile?.marketCap,
    }, null, 2)}`,
  });
  if (!result || !result.simple || result.makesMoney?.length < 3 || result.movesStock?.length < 3 || !result.faqs?.length) return null;
  return { content: result, facts };
}

type RecapData = {
  date: string;
  longDate: string;
  indexes: { symbol: string; label: string; changePercent: number }[];
  gainers: Move[];
  losers: Move[];
  headlines: Headline[];
};

export async function writeRecap(data: RecapData) {
  const termList = TERMS.map((term) => `${term.slug}: ${term.term}`).join("; ");
  const result = await writeWithTool<{ description: string; intro: string; sections: LearnSection[]; terms: string[] }>({
    tool: "write_market_recap",
    description: "Write today's stock market recap in simple words.",
    maxTokens: 2600,
    schema: {
      type: "object",
      properties: {
        description: { type: "string", description: "One sentence, under 155 characters, that says how the market did today. Include the S&P 500 move." },
        intro: { type: "string", description: "2 to 3 sentences answering: how did the stock market do today, in plain words." },
        sections: SECTIONS_SCHEMA,
        terms: { type: "array", minItems: 1, maxItems: 3, items: { type: "string" }, description: `Slugs of glossary terms that fit today's story, chosen from: ${termList}` },
      },
      required: ["description", "intro", "sections", "terms"],
    },
    prompt: `Write the stock market recap for ${data.longDate}. Sections to cover (use these headings or close variants): How the market did, What moved stocks today, Biggest movers, One idea to learn, What to watch next.

Rules for this recap: the percent moves for the S&P 500, Nasdaq 100 and Dow are measured through their tracking funds SPY, QQQ and DIA, so say "the S&P 500" naturally. Only explain a move if the headlines support it; otherwise say the reason is not clear yet. List movers only from the data. Never invent index levels or numbers.\n\n${JSON.stringify(data, null, 2)}`,
  });
  if (!result?.intro || !Array.isArray(result.sections) || result.sections.length < 3) return null;
  result.terms = (result.terms ?? []).filter((slug) => TERMS.some((term) => term.slug === slug));
  return result;
}

export async function writeGuide(topic: Topic) {
  const termList = TERMS.map((term) => `${term.slug}: ${term.term}`).join("; ");
  const result = await writeWithTool<{ description: string; intro: string; sections: LearnSection[]; terms: string[] }>({
    tool: "write_guide",
    description: "Write a beginner guide article.",
    maxTokens: 3200,
    schema: {
      type: "object",
      properties: {
        description: { type: "string", description: "One sentence under 155 characters that would make a beginner click, using natural search words." },
        intro: { type: "string", description: "2 to 3 sentences that answer the title question directly, in simple words." },
        sections: SECTIONS_SCHEMA,
        terms: { type: "array", minItems: 1, maxItems: 4, items: { type: "string" }, description: `Slugs of related glossary terms, chosen from: ${termList}` },
      },
      required: ["description", "intro", "sections", "terms"],
    },
    prompt: `Write a beginner guide titled "${topic.title}". Angle: ${topic.angle}. Aim for about 450 to 650 words in total across 4 to 6 sections. Use a simple everyday example in at least one section. Use only stable facts you are certain of, no statistics unless they are widely known and stable, and no dates. Educational only.`,
  });
  if (!result?.intro || !Array.isArray(result.sections) || result.sections.length < 3) return null;
  result.terms = (result.terms ?? []).filter((slug) => TERMS.some((term) => term.slug === slug));
  return result;
}
