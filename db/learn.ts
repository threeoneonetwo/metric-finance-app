import { and, asc, desc, eq, sql } from "drizzle-orm";
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

export const getLearnStock = (symbol: string) =>
  safe(null, async () => {
    const db = getDb();
    if (!db) return null;
    const [row] = await db.select().from(learnStockPages).where(eq(learnStockPages.symbol, symbol)).limit(1);
    return row ? { ...row, content: cleanStockContent(row.content) } : null;
  });

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

export const getLearnArticle = (slug: string) =>
  safe(null, async () => {
    const db = getDb();
    if (!db) return null;
    const [row] = await db.select().from(learnArticles).where(eq(learnArticles.slug, slug)).limit(1);
    return row ?? null;
  });

export const listLearnArticles = (kind: "market-today" | "guide", limit = 60) =>
  safe([] as (typeof learnArticles.$inferSelect)[], async () => {
    const db = getDb();
    if (!db) return [];
    return db.select().from(learnArticles).where(eq(learnArticles.kind, kind)).orderBy(desc(learnArticles.publishedOn), desc(learnArticles.createdAt)).limit(limit);
  });

export const saveLearnArticle = async (article: Omit<typeof learnArticles.$inferInsert, "createdAt">) => {
  const db = getDb();
  if (!db) throw new Error("No database");
  await db.insert(learnArticles).values(article).onConflictDoNothing();
};

export const articleExists = (slug: string) => safe(false, async () => Boolean(await getLearnArticle(slug)));

export const countGuides = () =>
  safe(0, async () => {
    const db = getDb();
    if (!db) return 0;
    const [row] = await db.select({ n: sql<number>`count(*)::int` }).from(learnArticles).where(and(eq(learnArticles.kind, "guide")));
    return row?.n ?? 0;
  });
