import { cookies } from "next/headers";
import { findSubscriberByToken } from "@/db/subscribers";
import { isValidManageLink, manageLinkParams } from "@/lib/manage-link";
import { SESSION_COOKIE, readSession } from "@/lib/session";

type LinkParams = { token?: string; exp?: string; sig?: string };

// Works out who is looking: a valid emailed link first, then the signed in cookie on this device.
export async function resolveSubscriber(link: LinkParams) {
  if (link.token && isValidManageLink(link.token, link.exp, link.sig)) {
    const subscriber = await findSubscriberByToken(link.token);
    if (subscriber) return { subscriber, creds: { token: link.token, exp: link.exp!, sig: link.sig! }, staleSession: false };
  }

  const session = readSession((await cookies()).get(SESSION_COOKIE)?.value);
  if (session) {
    const subscriber = await findSubscriberByToken(session.token);
    if (subscriber?.active) {
      const generated = new URLSearchParams(manageLinkParams(subscriber.unsubscribeToken));
      return {
        subscriber,
        creds: { token: subscriber.unsubscribeToken, exp: generated.get("exp")!, sig: generated.get("sig")! },
        staleSession: false,
      };
    }
    // A cookie for someone who no longer exists or has unsubscribed.
    return { subscriber: null, creds: null, staleSession: true };
  }

  return { subscriber: null, creds: null, staleSession: false };
}
