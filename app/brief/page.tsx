import type { Metadata } from "next";
import { SampleBrief } from "@/components/sample-brief";

export const metadata: Metadata = {
  title: "Sample Brief | Metric Finance",
  description: "A sample of the daily brief Metric Finance publishes every trading day at 5 PM ET: one sentence on what changed, one story explained, one idea you can use. Illustrative content, not real market data.",
  robots: { index: false, follow: false },
};

export default function BriefPage() {
  return <SampleBrief />;
}
