// Database helpers for the "why did this stock move" pages (/why/[symbol]/[date]).
// Every reader is kept in Next's data cache under WHY_TAG, so crawlers visiting these pages don't wake the Neon database.
// saveWhyPage clears that tag, so a new explainer shows up right away.
import { and, desc, eq } from "drizzle-orm";
import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";
import { getDb } from "./client";
import { whyPages } from "./schema";
import type { InstantExplainer } from "@/lib/instant/explain";

export const WHY_TAG = "why-pages";
const WEEK = 60 * 60 * 24 * 7;

/** One saved page: the explainer plus its stock and trading day. */
export type WhyPage = { symbol: string; sessionDate: string; explainer: InstantExplainer };

// Empty results instead of errors, so a missing table or a database hiccup never breaks a page.
async function safe<T>(fallback: T, run: () => Promise<T>): Promise<T> {
  try {
    return await run();
  } catch (error) {
    console.error("why db:", error instanceof Error ? error.message : error);
    return fallback;
  }
}

const toPage = (row: typeof whyPages.$inferSelect): WhyPage => ({ symbol: row.symbol, sessionDate: String(row.sessionDate).slice(0, 10), explainer: row.content as unknown as InstantExplainer });

/** Saves an explainer (the first one for a stock and session wins) and refreshes the cached lists. */
export async function saveWhyPage(explainer: InstantExplainer) {
  const db = getDb();
  if (!db) return false;
  const inserted = await db
    .insert(whyPages)
    .values({ symbol: explainer.symbol, sessionDate: explainer.sessionDate, content: explainer as unknown as Record<string, unknown> })
    .onConflictDoNothing()
    .returning({ symbol: whyPages.symbol });
  if (inserted.length > 0) {
    try {
      revalidateTag(WHY_TAG, { expire: 0 });
      const slug = explainer.symbol.toLowerCase().replace(/\./g, "-");
      for (const path of [`/why/${slug}/${explainer.sessionDate}`, `/why/${slug}`, "/why"]) revalidatePath(path);
    } catch {
      // Outside a request (a script): the cache refreshes on its own within a day.
    }
  }
  return inserted.length > 0;
}

/** One page, or null. */
export const getWhyPage = unstable_cache(
  (symbol: string, sessionDate: string) =>
    safe(null as WhyPage | null, async () => {
      const db = getDb();
      if (!db) return null;
      const [row] = await db.select().from(whyPages).where(and(eq(whyPages.symbol, symbol), eq(whyPages.sessionDate, sessionDate))).limit(1);
      return row ? toPage(row) : null;
    }),
  ["why-page"],
  { tags: [WHY_TAG], revalidate: WEEK },
);

/** Every page for one stock, newest first. */
export const listWhyPagesForSymbol = unstable_cache(
  (symbol: string) =>
    safe([] as WhyPage[], async () => {
      const db = getDb();
      if (!db) return [];
      return (await db.select().from(whyPages).where(eq(whyPages.symbol, symbol)).orderBy(desc(whyPages.sessionDate)).limit(400)).map(toPage);
    }),
  ["why-pages-symbol"],
  { tags: [WHY_TAG], revalidate: WEEK },
);

/** The newest pages across all stocks, newest session first. */
export const listRecentWhyPages = unstable_cache(
  (limit: number) =>
    safe([] as WhyPage[], async () => {
      const db = getDb();
      if (!db) return [];
      return (await db.select().from(whyPages).orderBy(desc(whyPages.sessionDate), desc(whyPages.createdAt)).limit(limit)).map(toPage);
    }),
  ["why-pages-recent"],
  { tags: [WHY_TAG], revalidate: WEEK },
);
