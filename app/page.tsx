import type { Metadata } from "next";
import { LandingViewEvent } from "@/components/analytics-events";
import { NewsletterLanding } from "@/components/newsletter-landing";
import { FAQS } from "@/lib/faqs";

export const metadata: Metadata = {
  title: "Metric Finance | Stocks explained like you're 5",
  description:
    "A free daily brief for beginners that explains up to five US stocks like you're 5, shows why each moved at 5 PM ET and answers your follow up questions.",
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
      description: "Metric Finance explains US stocks like you're 5, in simple words for beginners.",
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
        "A free daily brief for beginners that explains up to five US stocks like you're 5, shows why each moved at 5 PM ET and answers your follow up questions.",
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
