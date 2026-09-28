import type { Metadata } from "next";
import { LandingViewEvent } from "@/components/analytics-events";
import { NewsletterLanding } from "@/components/newsletter-landing";

export const metadata: Metadata = {
  title: "Stocks Explained Like You're 5 for free | Metric Finance",
  description:
    "Pick up to 5 US stocks and get a free daily email explaining why each one moved, like you're 5. Earnings, news and price moves, zero jargon. No advice, ever.",
  alternates: { canonical: "https://metricfinance.app/" },
};

const STRUCTURED_DATA = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://metricfinance.app/#organization",
      name: "Metric Finance",
      url: "https://metricfinance.app/",
      logo: "https://metricfinance.app/icon-512.png",
      email: "vanshpandita11@gmail.com",
      founder: [
        { "@type": "Person", name: "Yashna", sameAs: "https://www.linkedin.com/in/yashnapandugala/" },
        { "@type": "Person", name: "Vansh", sameAs: "https://www.linkedin.com/in/vanshpandita-real/" },
      ],
    },
    {
      "@type": "WebSite",
      "@id": "https://metricfinance.app/#website",
      name: "Metric Finance",
      url: "https://metricfinance.app/",
      publisher: { "@id": "https://metricfinance.app/#organization" },
    },
  ],
};

export default function Home() {
  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(STRUCTURED_DATA) }}
      />
      <LandingViewEvent />
      <NewsletterLanding />
    </main>
  );
}
