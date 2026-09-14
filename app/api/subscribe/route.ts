import { NextResponse } from "next/server";
import { upsertSubscriber } from "@/db/subscribers";
import { hasSesConfig, sendVerificationEmail } from "@/lib/newsletter/ses";

const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;
const TICKER_PATTERN = /^[A-Z0-9.]{1,10}$/;

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!isSubscribeBody(body)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const email = body.email.trim().toLowerCase();
  if (!EMAIL_PATTERN.test(email)) {
    return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
  }

  const tickers = body.tickers.map((ticker) => ticker.trim().toUpperCase()).slice(0, 5);
  if (tickers.length === 0 || !tickers.every((ticker) => TICKER_PATTERN.test(ticker))) {
    return NextResponse.json({ error: "Invalid tickers" }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim().slice(0, 100) : undefined;

  const subscriber = await upsertSubscriber({ email, tickers, name });
  if (!subscriber) {
    return NextResponse.json({ error: "Subscriptions are not available right now" }, { status: 503 });
  }

  if (!subscriber.active && subscriber.verificationToken && hasSesConfig()) {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://metricfinance.app";
    await sendVerificationEmail({
      to: subscriber.email,
      verifyUrl: `${baseUrl}/api/verify?token=${subscriber.verificationToken}`,
    });
  }

  return NextResponse.json({ ok: true, needsVerification: !subscriber.active });
}

function isSubscribeBody(value: unknown): value is { email: string; tickers: string[]; name?: string } {
  if (!value || typeof value !== "object") return false;
  const body = value as Record<string, unknown>;
  return (
    typeof body.email === "string" &&
    Array.isArray(body.tickers) &&
    body.tickers.every((ticker) => typeof ticker === "string") &&
    (body.name === undefined || typeof body.name === "string")
  );
}
