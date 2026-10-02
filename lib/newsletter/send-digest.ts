import { briefUrl, manageUrl } from "@/lib/manage-link";
import { recordBriefing } from "@/db/briefings";
import { isInternalEmail, trackServerNow } from "@/lib/analytics-server";
import type { BriefFacts } from "./brief-data";
import type { Brief } from "./brief-schema";
import { renderBriefEmail } from "./render-brief";
import { renderBriefNotification } from "./render-notification";
import { sendEmail } from "./ses";
import { writeBrief } from "./write-brief";

type DigestSubscriber = {
  id: string;
  email: string;
  tickers: string[];
  unsubscribeToken: string;
};

// Two subscribers with the same stocks get the same brief, so it is written once per run.
export type BriefCache = Map<string, Promise<Brief | null>>;

export async function sendDigestToSubscriber(input: {
  subscriber: DigestSubscriber;
  facts: BriefFacts;
  baseUrl: string;
  cache?: BriefCache;
}) {
  const tickers = input.subscriber.tickers.filter((ticker) => input.facts.tickers.has(ticker));
  if (tickers.length === 0) return { sent: false, reason: "no-data" as const };

  const key = tickers.join(",");
  let pending = input.cache?.get(key);
  if (!pending) {
    pending = writeBrief(input.facts, tickers);
    input.cache?.set(key, pending);
  }
  const brief = await pending;
  if (!brief) return { sent: false, reason: "no-brief" as const };

  const unsubscribeUrl = `${input.baseUrl}/api/unsubscribe?token=${input.subscriber.unsubscribeToken}`;
  const email = renderBriefEmail({
    brief,
    facts: input.facts,
    tickers,
    baseUrl: input.baseUrl,
    manageUrl: manageUrl(input.baseUrl, input.subscriber.unsubscribeToken),
    unsubscribeUrl,
  });

  // The full brief is saved first: the email only links to it on the website.
  const recorded = await recordBriefing({
    subscriberId: input.subscriber.id,
    tickers,
    html: email.html,
    text: email.text,
  });
  if (!recorded) return { sent: false, reason: "not-saved" as const };

  const notification = renderBriefNotification({
    headline: brief.subject,
    tickers,
    briefUrl: briefUrl(input.baseUrl, recorded.id, input.subscriber.unsubscribeToken),
    dashboardUrl: manageUrl(input.baseUrl, input.subscriber.unsubscribeToken),
    unsubscribeUrl,
  });

  await sendEmail({
    to: input.subscriber.email,
    subject: notification.subject,
    html: notification.html,
    text: notification.text,
    type: "brief",
    headers: {
      "List-Unsubscribe": `<${unsubscribeUrl}>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    },
  });

  await trackServerNow({
    event: "brief_sent",
    distinctId: input.subscriber.id,
    properties: { internal: isInternalEmail(input.subscriber.email), tickers_count: tickers.length },
  });

  return { sent: true as const };
}
