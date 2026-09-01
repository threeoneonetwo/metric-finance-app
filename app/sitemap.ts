import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://metricfinance.app";

  return [
    {
      url: base,
      changeFrequency: "daily",
      priority: 1,
    },
  ];
}
