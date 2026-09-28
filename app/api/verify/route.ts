import { NextResponse } from "next/server";
import { manageLinkParams, manageUrl } from "@/lib/manage-link";
import { markSubscribersSent, verifySubscriberByToken } from "@/db/subscribers";
import { generateTickerBlurbs, hasAnthropicConfig } from "@/lib/newsletter/generate-brief";
import { getTickerSnapshots, hasFmpConfig } from "@/lib/newsletter/market-data";
import { hasSesConfig } from "@/lib/newsletter/ses";
import { sendDigestToSubscriber } from "@/lib/newsletter/send-digest";
import { sendWelcomeEmail } from "@/lib/newsletter/send-welcome-email";

export const maxDuration = 30;

// Email security scanners prefetch links, so GET only renders a confirm button; the POST does the work.
export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token");
  if (!token || !/^[a-f0-9]{48}$/.test(token)) {
    return new NextResponse("Missing or invalid verification token.", { status: 400 });
  }

  return new NextResponse(
    `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Confirm your email | Metric Finance</title></head>
    <body style="background:#04070d;color:#f2f5fa;font-family:Arial,Helvetica,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;">
      <form method="post" action="/api/verify" style="text-align:center;padding:24px;">
        <h1 style="font-size:24px;margin:0 0 12px;">One last click</h1>
        <p style="color:#8798b4;margin:0 0 24px;">Confirm your email to start your daily Metric Finance briefing.</p>
        <input type="hidden" name="token" value="${token}">
        <button type="submit" style="background:#8fa8fa;color:#0b1220;border:0;padding:14px 28px;font-weight:700;font-size:15px;cursor:pointer;">Confirm my email</button>
      </form>
    </body></html>`,
    { status: 200, headers: { "content-type": "text/html; charset=utf-8" } },
  );
}

export async function POST(request: Request) {
  const form = await request.formData().catch(() => null);
  const token = form?.get("token");
  if (typeof token !== "string" || !token) {
    return new NextResponse("Missing verification token.", { status: 400 });
  }

  const subscriber = await verifySubscriberByToken(token);
  if (!subscriber) {
    return new NextResponse("That confirmation link is invalid or has already been used.", { status: 404 });
  }

  await sendFirstBriefing(subscriber);

  return NextResponse.redirect(
    new URL(`/welcome?email=${encodeURIComponent(subscriber.email)}&${manageLinkParams(subscriber.unsubscribeToken)}`, request.url),
    303,
  );
}

async function sendFirstBriefing(subscriber: { id: string; email: string; tickers: string[]; unsubscribeToken: string }) {
  if (subscriber.tickers.length === 0) return;
  if (!hasSesConfig()) {
    console.error("verify: SES is not configured");
    return;
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://metricfinance.app";

  // Always send welcome email
  try {
    await sendWelcomeEmail({
      to: subscriber.email,
      tickers: subscriber.tickers,
      briefUrl: `${baseUrl}/brief`,
      manageUrl: manageUrl(baseUrl, subscriber.unsubscribeToken),
    });
  } catch (error) {
    console.error("verify: failed to send welcome email", error);
  }

  // Send first briefing if fully configured
  if (!hasFmpConfig() || !hasAnthropicConfig()) {
    console.info("verify: skipping first briefing (missing FMP or Anthropic config)");
    return;
  }

  try {
    const snapshots = await getTickerSnapshots(subscriber.tickers);
    const blurbs = await generateTickerBlurbs(Array.from(snapshots.values()));

    const result = await sendDigestToSubscriber({ subscriber, snapshots, blurbs, baseUrl });
    if (result.sent) {
      await markSubscribersSent([subscriber.id]);
    }
  } catch (error) {
    console.error("verify: failed to send first briefing", error);
  }
}
