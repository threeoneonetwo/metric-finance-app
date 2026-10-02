import { NextResponse } from "next/server";
import { isRateLimited } from "@/db/rate-limit";
import { upsertSubscriber } from "@/db/subscribers";
import { isInternalEmail, trackServer } from "@/lib/analytics-server";
import { manageUrl } from "@/lib/manage-link";
import { hasSesConfig, sendReturningEmail, sendVerificationEmail } from "@/lib/newsletter/ses";

const EMAIL_PATTERN = /^[^\s@<>"']+@[^\s@<>"']+\.[^\s@<>"']+$/;
const TICKER_PATTERN = /^[A-Z0-9.]{1,10}$/;

export async function POST(request: Request) {
  const clientIp =
    request.headers.get("x-real-ip") || request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";

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
  if (email.length > 254 || !EMAIL_PATTERN.test(email)) {
    return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
  }

  const tickers = body.tickers.map((ticker) => ticker.trim().toUpperCase()).slice(0, 5);
  if (tickers.length === 0 || !tickers.every((ticker) => TICKER_PATTERN.test(ticker))) {
    return NextResponse.json({ error: "Invalid tickers" }, { status: 400 });
  }

  if (await tooManyRequests(clientIp, email)) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
  }

  const name = typeof body.name === "string" ? body.name.trim().slice(0, 100) : undefined;

  const subscriber = await upsertSubscriber({ email, tickers, name });
  if (!subscriber) {
    return NextResponse.json({ error: "Subscriptions are not available right now" }, { status: 503 });
  }

  if (!hasSesConfig()) {
    console.error("subscribe: SES is not configured, skipping email");
  } else {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://metricfinance.app";
    try {
      if (!subscriber.active && subscriber.verificationToken) {
        await sendVerificationEmail({
          to: subscriber.email,
          verifyUrl: `${baseUrl}/api/verify?token=${subscriber.verificationToken}`,
        });
      } else if (subscriber.active) {
        // They already have an account: send their dashboard link, then tell the visitor below.
        await sendReturningEmail({
          to: subscriber.email,
          dashboardUrl: manageUrl(baseUrl, subscriber.unsubscribeToken),
          unsubscribeUrl: `${baseUrl}/api/unsubscribe?token=${subscriber.unsubscribeToken}`,
        });
      }
    } catch (error) {
      console.error("subscribe: failed to send email", error);
    }
  }

  // The visitor's anonymous PostHog id links this signup to the visit that led to it.
  const visitorId = body.visitorId && body.visitorId.length <= 100 ? body.visitorId : undefined;
  const internal = isInternalEmail(subscriber.email);
  if (subscriber.active) {
    await trackServer({
      event: "signup_already_subscribed",
      distinctId: visitorId ?? subscriber.id,
      properties: { internal, tickers_count: tickers.length },
    });
  } else {
    await trackServer({
      event: "signup_submitted",
      distinctId: visitorId ?? subscriber.id,
      properties: { internal, tickers_count: tickers.length },
    });
    if (visitorId) {
      await trackServer({ event: "$identify", distinctId: subscriber.id, anonymousId: visitorId, properties: { internal } });
    }
  }

  // One signup per email: say so plainly. (This deliberately reveals that the address is subscribed.)
  if (subscriber.active) {
    return NextResponse.json(
      { error: "You've already signed up with this email.", code: "already_subscribed" },
      { status: 409 },
    );
  }

  return NextResponse.json({ ok: true, needsVerification: true });
}

function isSubscribeBody(value: unknown): value is { email: string; tickers: string[]; name?: string; visitorId?: string } {
  if (!value || typeof value !== "object") return false;
  const body = value as Record<string, unknown>;
  return (
    typeof body.email === "string" &&
    Array.isArray(body.tickers) &&
    body.tickers.every((ticker) => typeof ticker === "string") &&
    (body.name === undefined || typeof body.name === "string") &&
    (body.visitorId === undefined || typeof body.visitorId === "string")
  );
}

async function tooManyRequests(ip: string, email: string) {
  try {
    // Per-email cap stops someone using the form to flood a victim's inbox.
    const [ipLimited, emailLimited] = await Promise.all([
      isRateLimited(`subscribe:ip:${ip}`, 5, 60),
      isRateLimited(`subscribe:email:${email}`, 3, 60 * 60),
    ]);
    return ipLimited || emailLimited;
  } catch (error) {
    // Fail open so a rate-limit table outage can't block all signups.
    console.error("subscribe: rate limit check failed", error);
    return false;
  }
}
