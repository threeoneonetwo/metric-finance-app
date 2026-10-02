import { randomBytes } from "crypto";
import { eq } from "drizzle-orm";
import { getDb } from "./client";
import { subscribers } from "./schema";

export type SubscriberInput = {
  email: string;
  tickers: string[];
  name?: string;
};

export async function upsertSubscriber(input: SubscriberInput) {
  const db = getDb();
  if (!db) return null;

  const email = input.email.trim().toLowerCase();
  const tickers = input.tickers.map((ticker) => ticker.trim().toUpperCase()).slice(0, 5);
  const name = input.name?.trim() || undefined;
  const verificationToken = randomBytes(24).toString("hex");

  const [existing] = await db.select().from(subscribers).where(eq(subscribers.email, email)).limit(1);

  if (existing) {
    // Anyone can submit any email, so never modify a verified subscriber from an unauthenticated signup.
    if (existing.active) return existing;

    const [updated] = await db
      .update(subscribers)
      .set({ tickers, name: name ?? existing.name, verificationToken, updatedAt: new Date() })
      .where(eq(subscribers.email, email))
      .returning();
    return updated ?? null;
  }

  // Two submissions of the same new email at the same moment must still end up as one row.
  const [created] = await db
    .insert(subscribers)
    .values({
      email,
      name,
      tickers,
      verificationToken,
      unsubscribeToken: randomBytes(24).toString("hex"),
    })
    .onConflictDoNothing({ target: subscribers.email })
    .returning();

  if (created) return created;

  const [winner] = await db.select().from(subscribers).where(eq(subscribers.email, email)).limit(1);
  return winner ?? null;
}

export async function verifySubscriberByToken(token: string) {
  const db = getDb();
  if (!db) return null;

  const [updated] = await db
    .update(subscribers)
    .set({ active: true, verifiedAt: new Date(), verificationToken: null, updatedAt: new Date() })
    .where(eq(subscribers.verificationToken, token))
    .returning();

  return updated ?? null;
}

export async function findSubscriberByEmail(email: string) {
  const db = getDb();
  if (!db) return null;

  const [subscriber] = await db
    .select()
    .from(subscribers)
    .where(eq(subscribers.email, email.trim().toLowerCase()))
    .limit(1);

  return subscriber ?? null;
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

export async function updateTickersByToken(token: string, tickers: string[]) {
  const db = getDb();
  if (!db) return null;

  const normalized = tickers.map((ticker) => ticker.trim().toUpperCase()).slice(0, 5);

  const [updated] = await db
    .update(subscribers)
    .set({ tickers: normalized, active: true, updatedAt: new Date() })
    .where(eq(subscribers.unsubscribeToken, token))
    .returning();

  return updated ?? null;
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

// A hard bounce or a spam complaint means this address should not be mailed again.
export async function deactivateSubscriberByEmail(email: string) {
  const db = getDb();
  if (!db) return null;

  const [updated] = await db
    .update(subscribers)
    .set({ active: false, updatedAt: new Date() })
    .where(eq(subscribers.email, email.trim().toLowerCase()))
    .returning();

  return updated ?? null;
}
