import { randomBytes } from "crypto";
import { eq } from "drizzle-orm";
import { getDb } from "./client";
import { subscribers } from "./schema";

export type SubscriberInput = {
  email: string;
  tickers: string[];
};

export async function upsertSubscriber(input: SubscriberInput) {
  const db = getDb();
  if (!db) return null;

  const email = input.email.trim().toLowerCase();
  const tickers = input.tickers.map((ticker) => ticker.trim().toUpperCase()).slice(0, 5);

  const [existing] = await db.select().from(subscribers).where(eq(subscribers.email, email)).limit(1);

  if (existing) {
    const [updated] = await db
      .update(subscribers)
      .set({ tickers, active: true, updatedAt: new Date() })
      .where(eq(subscribers.email, email))
      .returning();
    return updated ?? null;
  }

  const [created] = await db
    .insert(subscribers)
    .values({
      email,
      tickers,
      unsubscribeToken: randomBytes(24).toString("hex"),
    })
    .returning();

  return created ?? null;
}

export async function findSubscriberByToken(token: string) {
  const db = getDb();
  if (!db) return null;

  const [subscriber] = await db
    .select()
    .from(subscribers)
    .where(eq(subscribers.unsubscribeToken, token))
    .limit(1);

  return subscriber ?? null;
}

export async function unsubscribeByToken(token: string) {
  const db = getDb();
  if (!db) return null;

  const [updated] = await db
    .update(subscribers)
    .set({ active: false, updatedAt: new Date() })
    .where(eq(subscribers.unsubscribeToken, token))
    .returning();

  return updated ?? null;
}

export async function listActiveSubscribers() {
  const db = getDb();
  if (!db) return [];

  return db.select().from(subscribers).where(eq(subscribers.active, true));
}

export async function markSubscribersSent(ids: string[]) {
  const db = getDb();
  if (!db || ids.length === 0) return;

  await Promise.all(
    ids.map((id) => db.update(subscribers).set({ lastSentAt: new Date() }).where(eq(subscribers.id, id))),
  );
}
