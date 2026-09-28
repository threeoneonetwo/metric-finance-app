import { sql } from "drizzle-orm";
import { getDb } from "./client";
import { rateLimits } from "./schema";

// Atomic fixed-window counter in Postgres, shared across all serverless instances.
export async function isRateLimited(key: string, max: number, windowSeconds: number) {
  const db = getDb();
  if (!db) return false;

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

  return (row?.count ?? 0) > max;
}
