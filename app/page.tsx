import type { Metadata } from "next";
import { LandingViewEvent } from "@/components/analytics-events";
import { NewsletterLanding } from "@/components/newsletter-landing";

export const metadata: Metadata = {
  title: "Stocks Explained in Plain English | Metric Finance",
  description:
    "Choose the US stocks you follow and get a free daily briefing covering price action, fundamentals, peers, and the news that matters.",
};

export default function Home() {
  return (
    <main>
      <LandingViewEvent />
      <NewsletterLanding />
    </main>
  );
}
