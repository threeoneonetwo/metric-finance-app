import { NextResponse } from "next/server";
import { addVote, getRoadmap, removeVote, suggestIdea } from "@/db/roadmap";
import { hitRateLimit } from "@/db/rate-limit";
import { isInternalEmail, trackServer } from "@/lib/analytics-server";
import { resolveSubscriber } from "@/lib/session-server";

const IDEA_ID = /^[a-z0-9-]{1,40}$/;
const MAX_SUGGESTION = 100;

// Votes and suggestions for the product roadmap. Same identity rules as the brief: signed link or sign in cookie.
export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const link = Object.fromEntries((["token", "exp", "sig"] as const).map((key) => [key, typeof body[key] === "string" ? (body[key] as string) : undefined]));
  const { subscriber } = await resolveSubscriber(link);
  if (!subscriber) return NextResponse.json({ error: "Please open the roadmap from your brief or dashboard." }, { status: 401 });

  const internal = isInternalEmail(subscriber.email);
  if ((await hitRateLimit(`roadmap:${subscriber.id}`, 120, 60 * 60)).limited) {
    return NextResponse.json({ error: "That's a lot of changes. Give it a minute and try again." }, { status: 429 });
  }

  if (body.action === "vote" || body.action === "unvote") {
    const ideaId = typeof body.ideaId === "string" && IDEA_ID.test(body.ideaId) ? body.ideaId : null;
    if (!ideaId) return NextResponse.json({ error: "Invalid idea" }, { status: 400 });
    if (body.action === "vote") {
      const added = await addVote(subscriber.id, ideaId);
      if (!added) return NextResponse.json({ error: "out_of_votes", state: await getRoadmap(subscriber.id) }, { status: 409 });
    } else {
      await removeVote(subscriber.id, ideaId);
    }
    await trackServer({ event: body.action === "vote" ? "roadmap_voted" : "roadmap_unvoted", distinctId: subscriber.id, properties: { internal, idea_id: ideaId } });
    return NextResponse.json({ ok: true, state: await getRoadmap(subscriber.id) });
  }

  if (body.action === "suggest") {
    const text = typeof body.text === "string" ? body.text.replace(/\s+/g, " ").trim() : "";
    if (text.length < 4 || text.length > MAX_SUGGESTION) {
      return NextResponse.json({ error: `Keep it between 4 and ${MAX_SUGGESTION} characters.` }, { status: 400 });
    }
    if ((await hitRateLimit(`roadmap-suggest:${subscriber.id}`, 5, 24 * 60 * 60)).limited) {
      return NextResponse.json({ error: "That's 5 ideas today, thank you! Send more tomorrow." }, { status: 429 });
    }
    await suggestIdea(subscriber.id, text);
    await trackServer({ event: "roadmap_suggested", distinctId: subscriber.id, properties: { internal, length: text.length } });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
