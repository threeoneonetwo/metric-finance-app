import type { Metadata } from "next";
import { StatusLink, StatusPage } from "@/components/status-page";

export const metadata: Metadata = {
  title: "You're confirmed | Metric Finance",
  robots: { index: false, follow: false },
};

type WelcomePageProps = {
  searchParams: Promise<{ email?: string; token?: string; exp?: string; sig?: string }>;
};

export default async function WelcomePage({ searchParams }: WelcomePageProps) {
  const { email: rawEmail, token, exp, sig } = await searchParams;
  const email =
    rawEmail && rawEmail.length <= 254 && /^[^\s@<>"']+@[^\s@<>"']+\.[^\s@<>"']+$/.test(rawEmail) ? rawEmail : undefined;

  return (
    <StatusPage
      tone="success"
      title="You're confirmed"
      actions={
        <>
          {token && exp && sig && (
            <StatusLink href={`/manage?${new URLSearchParams({ token, exp, sig })}`}>Manage your watchlist</StatusLink>
          )}
          <StatusLink href="/brief" secondary>Read a sample brief</StatusLink>
        </>
      }
    >
      {email ? <strong style={{ color: "#fff" }}>{email}</strong> : "You"} {email ? "is" : "are"} set up to get the daily
      Metric Finance brief. Expect your first one soon, then one posted every trading day at 5 PM ET. We email you a link each time.
    </StatusPage>
  );
}
