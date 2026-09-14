import { recordBriefing } from "@/db/briefings";
import { buildDigestEmail } from "./generate-brief";
import type { TickerSnapshot } from "./market-data";
import { sendEmail } from "./ses";

type DigestSubscriber = {
  id: string;
  email: string;
  tickers: string[];
  unsubscribeToken: string;
};

export async function sendDigestToSubscriber(input: {
  subscriber: DigestSubscriber;
  snapshots: Map<string, TickerSnapshot>;
  blurbs: Map<string, string>;
  baseUrl: string;
}) {
  const digest = buildDigestEmail({
    tickers: input.subscriber.tickers,
    snapshots: input.snapshots,
    blurbs: input.blurbs,
    manageUrl: `${input.baseUrl}/manage?token=${input.subscriber.unsubscribeToken}`,
    unsubscribeUrl: `${input.baseUrl}/api/unsubscribe?token=${input.subscriber.unsubscribeToken}`,
  });

  if (!digest.hasContent) {
    return { sent: false, reason: "no-content" as const };
  }

  await sendEmail({
    to: input.subscriber.email,
    subject: "Your Metric Finance briefing",
    html: digest.html,
    text: digest.text,
  });

  await recordBriefing({
    subscriberId: input.subscriber.id,
    tickers: input.subscriber.tickers,
    html: digest.html,
    text: digest.text,
  });

  return { sent: true as const };
}
