import { sql } from "drizzle-orm";
import { getDb } from "./client";
import { rateLimits } from "./schema";

// Atomic fixed window counter in Postgres, shared across all serverless instances.
export async function isRateLimited(key: string, max: number, windowSeconds: number) {
  return (await hitRateLimit(key, max, windowSeconds)).limited;
}

/** Counts one hit and reports how many have been used in the current window. */
export async function hitRateLimit(key: string, max: number, windowSeconds: number) {
  const db = getDb();
  if (!db) return { limited: false, used: 0 };

  const window = sql`now() + make_interval(secs => ${windowSeconds})`;
  const [row] = await db
    .insert(rateLimits)
    .values({ key, count: 1, resetAt: window })
    .onConflictDoUpdate({
      target: rateLimits.key,
      set: {
        count: sql`CASE WHEN ${rateLimits.resetAt} < now() THEN 1 ELSE ${rateLimits.count} + 1 END`,
        resetAt: sql`CASE WHEN ${rateLimits.resetAt} < now() THEN ${window} ELSE ${rateLimits.resetAt} END`,
      },
    })
    .returning({ count: rateLimits.count });

  const used = row?.count ?? 0;
  return { limited: used > max, used };
}

/** Gives back one hit, for example when the work it paid for failed on our side. */
export async function refundRateLimit(key: string) {
  const db = getDb();
  if (!db) return;
  await db
    .update(rateLimits)
    .set({ count: sql`GREATEST(${rateLimits.count} - 1, 0)` })
    .where(sql`${rateLimits.key} = ${key}`);
}
