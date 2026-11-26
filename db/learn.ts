import { and, asc, desc, eq, sql } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import { getDb } from "./client";
import { learnArticles, learnStockPages, type LearnStockContent, type LearnStockFacts } from "./schema";

// The Learn tables are created by db/migrations/0007_learn_content.sql. If they are missing or the database is down,
// every reader returns an empty result so the pages fall back to their built in content instead of failing.
async function safe<T>(fallback: T, run: () => Promise<T>): Promise<T> {
  try {
    return await run();
  } catch (error) {
    console.error("learn db:", error instanceof Error ? error.message : error);
    return fallback;
  }
}

// The writer occasionally returns list entries as {item: "..."} instead of plain strings, which breaks page rendering.
// Flatten them on the way in and on the way out so one odd row can never fail a build.
const flatList = (value: unknown): string[] =>
  (Array.isArray(value) ? value : [])
    .map((entry) => (typeof entry === "string" ? entry : entry && typeof entry === "object" ? Object.values(entry)[0] : ""))
    .filter((entry): entry is string => typeof entry === "string" && entry.trim().length > 0);

const cleanStockContent = (content: LearnStockContent): LearnStockContent => ({
  ...content,
  makesMoney: flatList(content.makesMoney),
  movesStock: flatList(content.movesStock),
  goodToKnow: flatList(content.goodToKnow),
});

// Cache tags. The daily Learn job calls revalidateTag with these after it saves, so readers see new content right away.
export const LEARN_STOCKS_TAG = "learn-stocks";
export const LEARN_ARTICLES_TAG = "learn-articles";
const DAY = 86400;

// Neon's free plan bills by the hours the database is awake, and every page render that queries it wakes it up.
// Bots crawl thousands of stock pages, and most of them have no saved guide, so instead of one query per page we load
// all saved guides in one go (a few hundred rows) and keep them in Next's data cache for a day.
const allLearnStocks = unstable_cache(
  () =>
    safe([] as (typeof learnStockPages.$inferSelect)[], async () => {
      const db = getDb();
      if (!db) return [];
      return db.select().from(learnStockPages);
    }),
  ["learn-stocks-all"],
  { tags: [LEARN_STOCKS_TAG], revalidate: DAY },
);

// Fetches the saved guide for one stock symbol, or null if there isn't one yet. Served from the cache above.
export const getLearnStock = async (symbol: string) => {
  const row = (await allLearnStocks()).find((entry) => entry.symbol === symbol);
  // The cache stores dates as text, so turn generatedAt back into a Date.
  return row ? { ...row, generatedAt: new Date(row.generatedAt), content: cleanStockContent(row.content) } : null;
};

export const saveLearnStock = async (symbol: string, content: LearnStockContent, facts: LearnStockFacts) => {
  const db = getDb();
  if (!db) throw new Error("No database");
  await db
    .insert(learnStockPages)
    .values({ symbol, content: cleanStockContent(content), facts, generatedAt: new Date() })
    .onConflictDoUpdate({ target: learnStockPages.symbol, set: { content: cleanStockContent(content), facts, generatedAt: new Date() } });
};

/** Symbols that already have a page, oldest first, so the daily run can refresh the stalest ones. */
export const listLearnStockAges = () =>
  safe([] as { symbol: string; generatedAt: Date }[], async () => {
    const db = getDb();
    if (!db) return [];
    return db.select({ symbol: learnStockPages.symbol, generatedAt: learnStockPages.generatedAt }).from(learnStockPages).orderBy(asc(learnStockPages.generatedAt));
  });

type LearnArticleRow = typeof learnArticles.$inferSelect;
// The cache stores dates as text, so turn createdAt back into a Date.
const reviveArticle = (row: LearnArticleRow): LearnArticleRow => ({ ...row, createdAt: new Date(row.createdAt) });

// Reads one saved article straight from the database (used by the daily job, which must see fresh data).
const readLearnArticle = (slug: string) =>
  safe(null as LearnArticleRow | null, async () => {
    const db = getDb();
    if (!db) return null;
    const [row] = await db.select().from(learnArticles).where(eq(learnArticles.slug, slug)).limit(1);
    return row ?? null;
  });

const cachedLearnArticle = unstable_cache(readLearnArticle, ["learn-article"], { tags: [LEARN_ARTICLES_TAG], revalidate: DAY });

// Fetches one saved article (a recap or guide) by its slug, or null if it doesn't exist. Cached for pages.
export const getLearnArticle = async (slug: string) => {
  const row = await cachedLearnArticle(slug);
  return row ? reviveArticle(row) : null;
};

const cachedLearnArticles = unstable_cache(
  (kind: "market-today" | "guide", limit: number) =>
    safe([] as LearnArticleRow[], async () => {
      const db = getDb();
      if (!db) return [];
      return db.select().from(learnArticles).where(eq(learnArticles.kind, kind)).orderBy(desc(learnArticles.publishedOn), desc(learnArticles.createdAt)).limit(limit);
    }),
  ["learn-articles-list"],
  { tags: [LEARN_ARTICLES_TAG], revalidate: DAY },
);

// Lists saved articles of one kind, newest first. Cached for pages.
export const listLearnArticles = async (kind: "market-today" | "guide", limit = 60) =>
  (await cachedLearnArticles(kind, limit)).map(reviveArticle);

export const saveLearnArticle = async (article: Omit<typeof learnArticles.$inferInsert, "createdAt">) => {
  const db = getDb();
  if (!db) throw new Error("No database");
  await db.insert(learnArticles).values(article).onConflictDoNothing();
};

export const articleExists = (slug: string) => safe(false, async () => Boolean(await readLearnArticle(slug)));

export const countGuides = () =>
  safe(0, async () => {
    const db = getDb();
    if (!db) return 0;
    const [row] = await db.select({ n: sql<number>`count(*)::int` }).from(learnArticles).where(and(eq(learnArticles.kind, "guide")));
    return row?.n ?? 0;
  });
