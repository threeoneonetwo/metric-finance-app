import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://metricfinance.app";
  const lastModified = new Date();

  return [
    {
      url: base,
      lastModified,
      changeFrequency: "daily",
      priority: 1,
    },
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
