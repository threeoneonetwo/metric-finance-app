import { NextResponse } from "next/server";
import { updateTickersByToken } from "@/db/subscribers";

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

  const subscriber = await updateTickersByToken(body.token, tickers);
  if (!subscriber) {
    return NextResponse.json({ error: "We couldn't find that subscription" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}

function isWatchlistBody(value: unknown): value is { token: string; tickers: string[] } {
  if (!value || typeof value !== "object") return false;
  const body = value as Record<string, unknown>;
  return (
    typeof body.token === "string" &&
    body.token.length > 0 &&
    Array.isArray(body.tickers) &&
    body.tickers.every((ticker) => typeof ticker === "string")
  );
}
