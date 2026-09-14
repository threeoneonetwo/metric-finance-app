import { desc, eq } from "drizzle-orm";
import { getDb } from "./client";
import { briefings } from "./schema";

export async function recordBriefing(input: { subscriberId: string; tickers: string[]; html: string; text: string }) {
  const db = getDb();
  if (!db) return null;

  const [created] = await db
    .insert(briefings)
    .values({
      subscriberId: input.subscriberId,
      tickers: input.tickers,
      html: input.html,
      text: input.text,
    })
    .returning();

  return created ?? null;
}

export async function listBriefingsForSubscriber(subscriberId: string, limit = 100) {
  const db = getDb();
  if (!db) return [];

  return db
    .select()
    .from(briefings)
    .where(eq(briefings.subscriberId, subscriberId))
    .orderBy(desc(briefings.sentAt))
    .limit(limit);
}
