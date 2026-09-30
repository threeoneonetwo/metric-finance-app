import { and, desc, eq } from "drizzle-orm";
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

// Only returns the brief if it belongs to this subscriber, so one reader can never open another's.
export async function getBriefingForSubscriber(id: string, subscriberId: string) {
  const db = getDb();
  if (!db) return null;

  const [briefing] = await db
    .select()
    .from(briefings)
    .where(and(eq(briefings.id, id), eq(briefings.subscriberId, subscriberId)))
    .limit(1);

  return briefing ?? null;
}
