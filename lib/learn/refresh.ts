import { revalidatePath } from "next/cache";
import { articleExists, listLearnStockAges, saveLearnArticle, saveLearnStock } from "@/db/learn";
import { hasWriter } from "./claude";
import { fetchGainers, fetchIndexMoves, fetchLosers, fetchProfile, QuotaError } from "./fmp";
import { writeGuide, writeRecap, writeStockPage } from "./generate";
import { pingIndexNow } from "./indexnow";
import { latestHeadlines } from "./news";
import { indexableStocks } from "./stocks";
import { TOPICS } from "./topics";
import { US_STOCKS } from "@/lib/stock-lookup";

const SITE = "https://metricfinance.app";
const US_SET = new Set(US_STOCKS.map((stock) => stock.symbol));

export type RefreshReport = { recap: string; guide: string; stocks: string[]; stocksNote: string; indexNow: boolean };

function newYorkParts(now: Date) {
  const get = (options: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", ...options }).format(now);
  const [month, day, year] = get({ month: "2-digit", day: "2-digit", year: "numeric" }).split("/");
  return { iso: `${year}-${month}-${day}`, weekday: get({ weekday: "long" }), longDate: get({ weekday: "long", month: "long", day: "numeric", year: "numeric" }) };
}

async function dailyRecap(now: Date, urls: string[]): Promise<string> {
  const { iso, weekday, longDate } = newYorkParts(now);
  if (weekday === "Saturday" || weekday === "Sunday") return "skipped: weekend";
  const slug = `market-today-${iso}`;
  if (await articleExists(slug)) return "skipped: already published";
  try {
    const indexes = await fetchIndexMoves();
    if (indexes.length === 0) return "skipped: no index data";
    const [gainers, losers, headlines] = await Promise.all([
      fetchGainers().catch(() => []),
      fetchLosers().catch(() => []),
      latestHeadlines("stock market today Wall Street", 8),
    ]);
    // Only well known US listed stocks at a real price, so the movers are useful and not tiny penny stocks.
    const keep = (moves: Awaited<ReturnType<typeof fetchGainers>>) => moves.filter((move) => US_SET.has(move.symbol) && move.price >= 5).slice(0, 5);
    const data = { date: iso, longDate, indexes, gainers: keep(gainers), losers: keep(losers), headlines };
    const recap = await writeRecap(data);
    if (!recap) return "failed: writer returned nothing";
    await saveLearnArticle({
      slug,
      kind: "market-today",
      title: `Stock Market Today: ${longDate}`,
      description: recap.description,
      intro: recap.intro,
      sections: recap.sections,
      extra: { movers: [...data.gainers, ...data.losers].map((move) => ({ symbol: move.symbol, changePercent: Number(move.changePercent.toFixed(2)) })), terms: recap.terms },
      publishedOn: iso,
    });
    urls.push(`${SITE}/learn/market-today/${iso}`, `${SITE}/learn/market-today`);
    return `published ${slug}`;
  } catch (error) {
    return `failed: ${error instanceof Error ? error.message : "error"}`;
  }
}

async function dailyGuide(now: Date, urls: string[]): Promise<string> {
  for (const topic of TOPICS) {
    if (await articleExists(topic.slug)) continue;
    const guide = await writeGuide(topic);
    if (!guide) return `failed: writer returned nothing for ${topic.slug}`;
    await saveLearnArticle({
      slug: topic.slug,
      kind: "guide",
      title: topic.title,
      description: guide.description,
      intro: guide.intro,
      sections: guide.sections,
      extra: { terms: guide.terms },
      publishedOn: newYorkParts(now).iso,
    });
    urls.push(`${SITE}/learn/guides/${topic.slug}`, `${SITE}/learn`);
    return `published ${topic.slug}`;
  }
  return "skipped: every topic is published";
}

async function refreshStocks(limit: number, deadline: number, urls: string[]): Promise<{ done: string[]; note: string }> {
  const ages = new Map((await listLearnStockAges()).map((row) => [row.symbol, row.generatedAt.getTime()]));
  // Stocks with no page yet come first (biggest first), then the stalest page.
  const queue = indexableStocks()
    .map((entry) => ({ entry, age: ages.get(entry.stock.symbol) ?? 0 }))
    .sort((a, b) => a.age - b.age)
    .slice(0, limit);
  const done: string[] = [];
  for (const { entry } of queue) {
    if (Date.now() > deadline) return { done, note: "stopped: out of time" };
    try {
      const profile = await fetchProfile(entry.stock.symbol);
      const page = await writeStockPage({
        symbol: entry.stock.symbol,
        name: entry.name,
        exchange: entry.stock.exchange,
        sector: entry.profile?.sector ?? null,
        industry: entry.profile?.industry ?? null,
        profile,
      });
      if (!page) return { done, note: "stopped: writer returned nothing" };
      await saveLearnStock(entry.stock.symbol, page.content, page.facts);
      done.push(entry.stock.symbol);
      urls.push(`${SITE}/learn/stocks/${entry.slug}`);
      revalidatePath(`/learn/stocks/${entry.slug}`);
    } catch (error) {
      return { done, note: error instanceof QuotaError ? `stopped: market data limit (${error.message})` : `stopped: ${error instanceof Error ? error.message : "error"}` };
    }
  }
  return { done, note: "ok" };
}

/** The daily Learn job: a market recap, one new guide, and a batch of refreshed stock pages. */
export async function refreshLearn(options: { stockLimit?: number; only?: ("recap" | "guide" | "stocks")[] } = {}): Promise<RefreshReport> {
  const started = Date.now();
  const only = options.only ?? ["recap", "guide", "stocks"];
  const report: RefreshReport = { recap: "not run", guide: "not run", stocks: [], stocksNote: "not run", indexNow: false };
  if (!hasWriter()) return { ...report, recap: "skipped: no writer key", guide: "skipped: no writer key", stocksNote: "skipped: no writer key" };

  const urls: string[] = [];
  if (only.includes("recap")) report.recap = await dailyRecap(new Date(), urls);
  if (only.includes("guide")) report.guide = await dailyGuide(new Date(), urls);
  if (only.includes("stocks")) {
    const result = await refreshStocks(options.stockLimit ?? 12, started + 180_000, urls);
    report.stocks = result.done;
    report.stocksNote = result.note;
  }

  for (const path of ["/learn", "/learn/market-today", "/learn/stocks", "/sitemap.xml"]) revalidatePath(path);
  report.indexNow = await pingIndexNow(urls);
  return report;
}
