import { NextResponse } from "next/server";
import { updateTickersByToken } from "@/db/subscribers";
import { isInternalEmail, trackServer } from "@/lib/analytics-server";
import { isValidManageLink } from "@/lib/manage-link";

const TICKER_PATTERN = /^[A-Z0-9.]{1,10}$/;

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!isWatchlistBody(body)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const tickers = body.tickers.map((ticker) => ticker.trim().toUpperCase()).slice(0, 5);
  if (tickers.length === 0 || !tickers.every((ticker) => TICKER_PATTERN.test(ticker))) {
    return NextResponse.json({ error: "Invalid tickers" }, { status: 400 });
  }

  if (!isValidManageLink(body.token, body.exp, body.sig)) {
    return NextResponse.json({ error: "This link has expired" }, { status: 403 });
  }

  const subscriber = await updateTickersByToken(body.token, tickers);
  if (!subscriber) {
    return NextResponse.json({ error: "We couldn't find that subscription" }, { status: 404 });
  }

  await trackServer({
    event: "watchlist_changed",
    distinctId: subscriber.id,
    properties: { internal: isInternalEmail(subscriber.email), tickers_count: tickers.length },
  });

  return NextResponse.json({ ok: true });
}

function isWatchlistBody(value: unknown): value is { token: string; exp: string; sig: string; tickers: string[] } {
  if (!value || typeof value !== "object") return false;
  const body = value as Record<string, unknown>;
  return (
    typeof body.token === "string" &&
    body.token.length > 0 &&
    typeof body.exp === "string" &&
    typeof body.sig === "string" &&
    Array.isArray(body.tickers) &&
    body.tickers.every((ticker) => typeof ticker === "string")
  );
}
