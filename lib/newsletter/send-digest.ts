import { manageUrl } from "@/lib/manage-link";
import { recordBriefing } from "@/db/briefings";
import type { BriefFacts } from "./brief-data";
import type { Brief } from "./brief-schema";
import { renderBriefEmail } from "./render-brief";
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

  await sendEmail({
    to: input.subscriber.email,
    subject: email.subject,
    html: email.html,
    text: email.text,
    headers: {
      "List-Unsubscribe": `<${unsubscribeUrl}>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    },
  });

  await recordBriefing({
    subscriberId: input.subscriber.id,
    tickers,
    html: email.html,
    text: email.text,
  });

  return { sent: true as const };
}
