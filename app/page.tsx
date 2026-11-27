import type { Metadata } from "next";
import { NewsletterLanding } from "@/components/newsletter-landing";
import { FAQS } from "@/lib/faqs";
import { listRecentWhyPages } from "@/db/why";
import { getLastMoves } from "@/lib/prices";
import { STOCKS } from "@/lib/stocks";
import { whyHref } from "@/lib/why";
import type { Mover } from "@/components/movers-strip";

// The movers strip refreshes every half hour (prices are cached for a few hours, so this costs nothing extra).
export const revalidate = 1800;

// The popular stocks the strip picks its six biggest moves from.
const POPULAR = STOCKS.slice(0, 16).map((stock) => stock.symbol);

// The six biggest moves among popular stocks at the last close. Each links to that day's explainer when one exists.
async function loadMovers(): Promise<Mover[]> {
  const [moves, pages] = await Promise.all([getLastMoves(POPULAR), listRecentWhyPages(300)]);
  const latest = moves.reduce((date, move) => (move.date > date ? move.date : date), "");
  return moves
    .filter((move) => move.date === latest)
    .slice(0, 6)
    .map((move) => {
      const page = pages.find((item) => item.symbol === move.symbol && item.sessionDate === move.date);
      const stock = STOCKS.find((item) => item.symbol === move.symbol);
      return {
        symbol: move.symbol,
        name: (stock?.name ?? move.symbol).replace(/,? (Inc\.|Corporation|Incorporated|Company|Co\.)$/, "").replace(/^The /, ""),
        changePercent: move.changePercent,
        date: move.date,
        closes: move.history.map((day) => day.close),
        href: page ? whyHref(page) : `/learn/stocks/${move.symbol.toLowerCase().replace(/\./g, "-")}`,
        explained: Boolean(page),
      };
    });
}

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

export default async function Home() {
  const movers = await loadMovers().catch(() => []);
  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(STRUCTURED_DATA) }}
      />
      <NewsletterLanding movers={movers} />
    </main>
  );
}
