import type { MetadataRoute } from "next";
import { listLearnArticles, listLearnStockAges } from "@/db/learn";
import { GUIDES } from "@/lib/learn/guides";
import { comparePairs, indexableStocks } from "@/lib/learn/stocks";
import { TERMS } from "@/lib/learn/terms";

// Rebuilt hourly so new daily recaps and guides appear without a deploy.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [recaps, storedGuides, stockAges] = await Promise.all([listLearnArticles("market-today", 400), listLearnArticles("guide", 400), listLearnStockAges()]);
  const stockUpdated = new Map(stockAges.map((row) => [row.symbol, row.generatedAt]));
  const base = "https://metricfinance.app";
  const lastModified = new Date();

  return [
    {
      url: base,
      lastModified,
      changeFrequency: "daily",
      priority: 1,
    },
    { url: `${base}/learn`, lastModified, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/learn/stocks`, lastModified, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/learn/market-today`, lastModified, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/learn/guides`, lastModified, changeFrequency: "weekly", priority: 0.8 },
    ...recaps.map((recap) => ({ url: `${base}/learn/market-today/${recap.publishedOn}`, lastModified: recap.createdAt, changeFrequency: "never" as const, priority: 0.6 })),
    ...storedGuides.map((guide) => ({ url: `${base}/learn/guides/${guide.slug}`, lastModified: guide.createdAt, changeFrequency: "monthly" as const, priority: 0.7 })),
    { url: `${base}/learn/terms`, lastModified, changeFrequency: "monthly", priority: 0.7 },
    ...GUIDES.map((guide) => ({ url: `${base}/learn/guides/${guide.slug}`, lastModified, changeFrequency: "monthly" as const, priority: 0.7 })),
    ...TERMS.map((term) => ({ url: `${base}/learn/terms/${term.slug}`, lastModified, changeFrequency: "monthly" as const, priority: 0.6 })),
    ...indexableStocks().map((entry) => ({ url: `${base}/learn/stocks/${entry.slug}`, lastModified: stockUpdated.get(entry.stock.symbol) ?? lastModified, changeFrequency: "monthly" as const, priority: 0.7 })),
    ...comparePairs().map(([a, b]) => ({ url: `${base}/learn/compare/${a.slug}-vs-${b.slug}`, lastModified, changeFrequency: "monthly" as const, priority: 0.5 })),
    {
      url: `${base}/privacy`,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${base}/terms`,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}
