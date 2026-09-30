import type { Metadata } from "next";
import { StatusLink, StatusPage, StatusSubmit } from "@/components/status-page";

export const metadata: Metadata = {
  title: "Unsubscribe | Metric Finance",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

type UnsubscribedPageProps = { searchParams: Promise<{ status?: string; token?: string }> };

export default async function UnsubscribedPage({ searchParams }: UnsubscribedPageProps) {
  const { status, token } = await searchParams;

  if (status === "confirm" && token && /^[a-f0-9]{48}$/.test(token)) {
    return (
      <StatusPage
        tone="info"
        title="Unsubscribe from Metric Finance?"
        actions={
          <>
            <form method="post" action="/api/unsubscribe">
              <input type="hidden" name="token" value={token} />
              <StatusSubmit>Yes, unsubscribe me</StatusSubmit>
            </form>
            <StatusLink href="/" secondary>Keep my brief</StatusLink>
          </>
        }
      >
        You&apos;ll stop getting the daily brief straight away. You can always sign up again later.
      </StatusPage>
    );
  }

  if (status === "done") {
    return (
      <StatusPage
        tone="success"
        title="You're unsubscribed"
        actions={
          <>
            <StatusLink href="/#signup">Subscribe again</StatusLink>
            <StatusLink href="/" secondary>Back to Metric Finance</StatusLink>
          </>
        }
      >
        You won&apos;t get any more Metric Finance briefs. If that was a mistake, you can sign up again any time.
      </StatusPage>
    );
  }

  return (
    <StatusPage
      tone="error"
      title="We couldn't find that subscription"
      actions={
        <>
          <StatusLink href="/manage">Get a fresh link</StatusLink>
          <StatusLink href="/" secondary>Back to Metric Finance</StatusLink>
        </>
      }
    >
      The link may be incomplete, or the subscription may already be cancelled. Enter your email on the next page and
      we&apos;ll send you a new link.
    </StatusPage>
  );
}
