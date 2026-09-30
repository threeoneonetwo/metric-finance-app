import type { Metadata } from "next";
import { StatusLink, StatusPage, StatusSubmit } from "@/components/status-page";

export const metadata: Metadata = {
  title: "Confirm your email | Metric Finance",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

type VerifyPageProps = { searchParams: Promise<{ token?: string; error?: string }> };

export default async function VerifyPage({ searchParams }: VerifyPageProps) {
  const { token, error } = await searchParams;
  const validToken = token && /^[a-f0-9]{48}$/.test(token) ? token : null;

  if (error || !validToken) {
    return (
      <StatusPage
        tone="error"
        title="That link didn't work"
        actions={<StatusLink href="/#signup">Sign up again</StatusLink>}
      >
        This confirmation link is invalid or has already been used. If you already confirmed, you&apos;re all set.
        Otherwise sign up again and we&apos;ll send a fresh link.
      </StatusPage>
    );
  }

  return (
    <StatusPage
      tone="info"
      title="One last click"
      actions={
        <form method="post" action="/api/verify">
          <input type="hidden" name="token" value={validToken} />
          <StatusSubmit>Confirm my email</StatusSubmit>
        </form>
      }
    >
      Confirm your email to start getting your daily Metric Finance brief. Your first one follows soon after.
    </StatusPage>
  );
}
