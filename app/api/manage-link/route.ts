import { NextResponse } from "next/server";
import { isRateLimited } from "@/db/rate-limit";
import { findSubscriberByEmail } from "@/db/subscribers";
import { manageUrl } from "@/lib/manage-link";
import { brandedEmail } from "@/lib/newsletter/email-template";
import { hasSesConfig, sendEmail } from "@/lib/newsletter/ses";

const EMAIL_PATTERN = /^[^\s@<>"']+@[^\s@<>"']+\.[^\s@<>"']+$/;

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { email?: unknown } | null;
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  if (email.length > 254 || !EMAIL_PATTERN.test(email)) {
    return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
  }

  const ip = request.headers.get("x-real-ip") || request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  try {
    const [ipLimited, emailLimited] = await Promise.all([
      isRateLimited(`manage-link:ip:${ip}`, 10, 60 * 60),
      isRateLimited(`manage-link:email:${email}`, 3, 60 * 60),
    ]);
    if (ipLimited || emailLimited) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }
  } catch (error) {
    console.error("manage-link: rate limit check failed", error);
  }

  if (hasSesConfig()) {
    try {
      const subscriber = await findSubscriberByEmail(email);
      if (subscriber?.active) {
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://metricfinance.app";
        const link = manageUrl(baseUrl, subscriber.unsubscribeToken);
        await sendEmail({
          to: subscriber.email,
          subject: "Your Metric Finance account link",
          html: brandedEmail({
            preheader: "Your private link to change your stocks or unsubscribe.",
            eyebrow: "YOUR ACCOUNT",
            heading: "Your account link",
            lead: "Use this private link to change your stocks or unsubscribe. It works for 30 days.",
            buttonLabel: "Manage my watchlist",
            buttonUrl: link,
            footnote: "If you didn't ask for this, ignore this email. Only you can use the link.",
          }),
          text: `Use this private link to change your stocks or unsubscribe: ${link}\n\nThe link works for 30 days. If you didn't request it, you can ignore this email.`,
        });
      }
    } catch (error) {
      console.error("manage-link: failed to send", error);
    }
  }

  // Same answer whether or not the address is subscribed, so nobody can probe who is on the list.
  return NextResponse.json({ ok: true });
}
