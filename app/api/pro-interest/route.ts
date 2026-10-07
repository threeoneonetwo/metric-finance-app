import { NextResponse } from "next/server";
import { hitRateLimit } from "@/db/rate-limit";
import { isInternalEmail, trackServer } from "@/lib/analytics-server";
import { resolveSubscriber } from "@/lib/session-server";

const SOURCES = new Set(["ask_limit", "ask_footer"]);

// Records that a reader wants Pro. Sent from the server so ad blockers can't hide demand from the dashboard.
export async function POST(request: Request) {
  let body: Record<string, unknown> = {};
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const source = typeof body.source === "string" && SOURCES.has(body.source) ? body.source : "unknown";
  const link = Object.fromEntries((["token", "exp", "sig"] as const).map((key) => [key, typeof body[key] === "string" ? (body[key] as string) : undefined]));
  const { subscriber } = await resolveSubscriber(link);
  if (!subscriber) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  try {
    if ((await hitRateLimit(`pro:${subscriber.id}`, 10, 60 * 60)).limited) return NextResponse.json({ ok: true });
  } catch {
    // Counting interest is never worth an error for the reader.
  }
  await trackServer({
    event: "pro_interest_clicked",
    distinctId: subscriber.id,
    properties: { internal: isInternalEmail(subscriber.email), source },
  });
  return NextResponse.json({ ok: true });
}
