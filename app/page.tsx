import type { Metadata } from "next";
import { LandingViewEvent } from "@/components/analytics-events";
import { NewsletterLanding } from "@/components/newsletter-landing";
import { FAQS } from "@/lib/faqs";

export const metadata: Metadata = {
  title: "Stocks Explained Like You're 5 for free | Metric Finance",
  description:
    "Understand the stock market without the jargon: pick up to five US stocks and get a free brief every trading day at 5 PM ET on why each one moved.",
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
      description: "Metric Finance explains US stocks like you're 5, in plain English for beginners.",
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
      description:
        "Understand the stock market without the jargon: pick up to five US stocks and get a free brief every trading day at 5 PM ET on why each one moved.",
      inLanguage: "en-US",
      publisher: { "@id": "https://metricfinance.app/#organization" },
    },
    {
      "@type": "FAQPage",
      "@id": "https://metricfinance.app/#faq",
      mainEntity: FAQS.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: { "@type": "Answer", text: item.answer },
      })),
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
