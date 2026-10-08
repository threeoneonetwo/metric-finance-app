export type Brief = {
  subject: string;
  scope: "company" | "sector" | "market" | "mixed";
  todayInOneSentence: string;
  glance: Array<{ ticker: string; signal: string }>;
  lead: {
    ticker: string;
    title: string;
    whatHappened: string;
    whyItMatters: string;
    whatItChanges: string;
    whatItDoesntProve: string;
    nextCheckpoint: string;
  };
  rest: Array<{ ticker: string; text: string }>;
  idea: { term: string; explanation: string };
  watchNext: Array<{ label: string; text: string }>;
};

export const BRIEF_TOOL_SCHEMA = {
  type: "object",
  properties: {
    subject: { type: "string", description: "Email subject, max 60 characters, plain and specific, no dashes, no emojis." },
    scope: { type: "string", enum: ["company", "sector", "market", "mixed"], description: "Whether today's main move was one company, a sector, the whole market, or a mix." },
    todayInOneSentence: { type: "string", description: "25 to 40 words. What changed today and whether it was company, sector or market wide. No intro." },
    glance: {
      type: "array",
      description: "One row per watchlist stock, in the order given.",
      items: {
        type: "object",
        properties: { ticker: { type: "string" }, signal: { type: "string", description: "One signal in simple words, max 10 words. 'Nothing material today' is valid." } },
        required: ["ticker", "signal"],
      },
    },
    lead: {
      type: "object",
      description: "The single most material story from their stocks, about 150 words in total across the fields.",
      properties: {
        ticker: { type: "string" },
        title: { type: "string", description: "A short plain headline for the story." },
        whatHappened: { type: "string" },
        whyItMatters: { type: "string", description: "Simple words, may use one simple everyday analogy." },
        whatItChanges: { type: "string" },
        whatItDoesntProve: { type: "string" },
        nextCheckpoint: { type: "string", description: "Only reference an event or date that appears in the data." },
      },
      required: ["ticker", "title", "whatHappened", "whyItMatters", "whatItChanges", "whatItDoesntProve", "nextCheckpoint"],
    },
    rest: {
      type: "array",
      description: "Every stock except the lead, in the order given. Never retell the lead story.",
      items: {
        type: "object",
        properties: { ticker: { type: "string" }, text: { type: "string", description: "25 to 40 words. On a quiet day, one short line." } },
        required: ["ticker", "text"],
      },
    },
    idea: {
      type: "object",
      description: "Teach exactly one finance concept from the lead story.",
      properties: {
        term: { type: "string", description: "The concept name, 1 to 3 words." },
        explanation: { type: "string", description: "40 to 60 words, standalone so it makes sense to someone who never saw the brief." },
      },
      required: ["term", "explanation"],
    },
    watchNext: {
      type: "array",
      description: "1 or 2 bullets. Use only dates and numbers present in the data.",
      items: {
        type: "object",
        properties: { label: { type: "string", description: "Short bold lead in, e.g. 'Nvidia earnings.'" }, text: { type: "string", description: "What to look for, including the number when the data has one." } },
        required: ["label", "text"],
      },
    },
  },
  required: ["subject", "scope", "todayInOneSentence", "glance", "lead", "rest", "idea", "watchNext"],
} as const;

const words = (text: string) => text.trim().split(/\s+/).filter(Boolean).length;

function clean(text: unknown): string {
  return typeof text === "string" ? text.replace(/\s*[–—]\s*/g, ", ").replace(/\s+/g, " ").trim() : "";
}

// Returns a cleaned brief, or a reason it can't be trusted. Word limits have some slack so a good brief isn't thrown away for one extra word.
export function validateBrief(raw: unknown, tickers: string[]): { ok: true; brief: Brief } | { ok: false; reason: string } {
  const value = raw as Partial<Brief> | null;
  if (!value || typeof value !== "object") return { ok: false, reason: "not an object" };

  const scope = value.scope;
  if (scope !== "company" && scope !== "sector" && scope !== "market" && scope !== "mixed") return { ok: false, reason: "bad scope" };

  const subject = clean(value.subject).slice(0, 78);
  const sentence = clean(value.todayInOneSentence);
  if (!subject) return { ok: false, reason: "missing subject" };
  if (words(sentence) < 20 || words(sentence) > 50) return { ok: false, reason: `one sentence has ${words(sentence)} words` };

  const glance = (value.glance ?? []).map((row) => ({ ticker: String(row?.ticker ?? "").toUpperCase(), signal: clean(row?.signal) }));
  if (glance.length !== tickers.length || !tickers.every((ticker) => glance.some((row) => row.ticker === ticker && row.signal))) {
    return { ok: false, reason: "watchlist rows do not match the stocks" };
  }
  glance.sort((a, b) => tickers.indexOf(a.ticker) - tickers.indexOf(b.ticker));

  const leadRaw = value.lead;
  const leadTicker = String(leadRaw?.ticker ?? "").toUpperCase();
  if (!leadRaw || !tickers.includes(leadTicker)) return { ok: false, reason: "lead is not one of the stocks" };
  const lead = {
    ticker: leadTicker,
    title: clean(leadRaw.title),
    whatHappened: clean(leadRaw.whatHappened),
    whyItMatters: clean(leadRaw.whyItMatters),
    whatItChanges: clean(leadRaw.whatItChanges),
    whatItDoesntProve: clean(leadRaw.whatItDoesntProve),
    nextCheckpoint: clean(leadRaw.nextCheckpoint),
  };
  if (Object.values(lead).some((part) => !part)) return { ok: false, reason: "lead is incomplete" };
  const leadWords = words(Object.values(lead).slice(1).join(" "));
  if (leadWords < 90 || leadWords > 230) return { ok: false, reason: `lead has ${leadWords} words` };

  const expectedRest = tickers.filter((ticker) => ticker !== leadTicker);
  const rest = (value.rest ?? []).map((row) => ({ ticker: String(row?.ticker ?? "").toUpperCase(), text: clean(row?.text) }));
  if (rest.length !== expectedRest.length || !expectedRest.every((ticker) => rest.some((row) => row.ticker === ticker && row.text))) {
    return { ok: false, reason: "rest of stocks does not match" };
  }
  rest.sort((a, b) => expectedRest.indexOf(a.ticker) - expectedRest.indexOf(b.ticker));
  if (rest.some((row) => words(row.text) > 55)) return { ok: false, reason: "a rest entry is too long" };

  const idea = { term: clean(value.idea?.term), explanation: clean(value.idea?.explanation) };
  if (!idea.term || words(idea.explanation) < 30 || words(idea.explanation) > 80) return { ok: false, reason: "idea is the wrong size" };

  const watchNext = (value.watchNext ?? []).slice(0, 2).map((row) => ({ label: clean(row?.label), text: clean(row?.text) })).filter((row) => row.label && row.text);
  if (watchNext.length === 0) return { ok: false, reason: "nothing to watch" };

  return { ok: true, brief: { subject, scope, todayInOneSentence: sentence, glance, lead, rest, idea, watchNext } };
}
