import type { Metadata } from "next";
import { LandingViewEvent } from "@/components/analytics-events";
import { NewsletterLanding } from "@/components/newsletter-landing";

export const metadata: Metadata = {
  title: "Stocks Explained Like You're 5 for free | Metric Finance",
  description:
    "Pick up to 5 US stocks and get a free daily email explaining why each one moved, like you're 5. Earnings, news and price moves, zero jargon. No advice, ever.",
  alternates: { canonical: "https://metricfinance.app/" },
};

export default function Home() {
  return (
    <main>
      <LandingViewEvent />
      <NewsletterLanding />
    </main>
  );
}
