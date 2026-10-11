import { neon } from "@neondatabase/serverless";
import { randomUUID } from "node:crypto";

// Product roadmap tables (migration 0009_roadmap.sql). Readers get MAX_VOTES votes each; suggestions stay
// 'pending' (hidden) until the owner sets them to 'review'.
export const MAX_VOTES = 3;

export type RoadmapStatus = "review" | "planned" | "progress" | "shipped";
export type RoadmapIdea = { id: string; title: string; description: string; status: RoadmapStatus; pro: boolean; votes: number; createdAt: string };
export type ShippedIdea = { id: string; title: string; description: string; shippedAt: string };
export type RoadmapState = { ideas: RoadmapIdea[]; shipped: ShippedIdea[]; myVotes: string[] };

function client() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("No database");
  return neon(url);
}

type IdeaRow = { id: string; title: string; description: string; status: string; pro: boolean; votes: number; created_at: Date | string; shipped_at: Date | string | null };

const iso = (value: Date | string | null) => (value ? new Date(value).toISOString() : "");

export async function getRoadmap(subscriberId: string): Promise<RoadmapState> {
  const sql = client();
  const [rows, mine] = await Promise.all([
    sql`SELECT i.id, i.title, i.description, i.status, i.pro, i.created_at, i.shipped_at, COUNT(v.idea_id)::int AS votes
        FROM roadmap_ideas i LEFT JOIN roadmap_votes v ON v.idea_id = i.id
        WHERE i.status IN ('review', 'planned', 'progress', 'shipped')
        GROUP BY i.id`.then((rows) => rows as IdeaRow[]),
    sql`SELECT v.idea_id FROM roadmap_votes v JOIN roadmap_ideas i ON i.id = v.idea_id
        WHERE v.subscriber_id = ${subscriberId} AND i.status IN ('review', 'planned', 'progress')
        ORDER BY v.created_at`.then((rows) => rows as { idea_id: string }[]),
  ]);

  const ideas = rows
    .filter((row) => row.status !== "shipped")
    .map((row) => ({ id: row.id, title: row.title, description: row.description, status: row.status as RoadmapStatus, pro: row.pro, votes: row.votes, createdAt: iso(row.created_at) }));
  const shipped = rows
    .filter((row) => row.status === "shipped")
    .sort((a, b) => iso(b.shipped_at).localeCompare(iso(a.shipped_at)))
    .map((row) => ({ id: row.id, title: row.title, description: row.description, shippedAt: iso(row.shipped_at) }));
  return { ideas, shipped, myVotes: mine.map((row) => row.idea_id) };
}

/** Adds a vote if the idea is open and the reader has a vote left. Returns false when they are out of votes. */
export async function addVote(subscriberId: string, ideaId: string) {
  const sql = client();
  const inserted = (await sql`
    INSERT INTO roadmap_votes (subscriber_id, idea_id)
    SELECT ${subscriberId}, ${ideaId}
    WHERE EXISTS (SELECT 1 FROM roadmap_ideas WHERE id = ${ideaId} AND status IN ('review', 'planned', 'progress'))
      AND (SELECT COUNT(*) FROM roadmap_votes v JOIN roadmap_ideas i ON i.id = v.idea_id
           WHERE v.subscriber_id = ${subscriberId} AND i.status IN ('review', 'planned', 'progress')) < ${MAX_VOTES}
    ON CONFLICT DO NOTHING
    RETURNING idea_id`) as { idea_id: string }[];
  return inserted.length > 0;
}

export async function removeVote(subscriberId: string, ideaId: string) {
  await client()`DELETE FROM roadmap_votes WHERE subscriber_id = ${subscriberId} AND idea_id = ${ideaId}`;
}

export async function suggestIdea(subscriberId: string, text: string) {
  await client()`INSERT INTO roadmap_ideas (id, title, status, suggested_by) VALUES (${`s-${randomUUID().slice(0, 8)}`}, ${text}, 'pending', ${subscriberId})`;
}
