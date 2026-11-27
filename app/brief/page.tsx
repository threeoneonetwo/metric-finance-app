// The public sample brief page (/brief). Search engines may list it: it is the clearest demo of what readers get.
import type { Metadata } from "next";
import { SampleBrief } from "@/components/sample-brief";

export const metadata: Metadata = {
  title: "See a Daily Stock Brief Explained Like You're 5 | Metric Finance",
  description: "A sample of the daily brief Metric Finance publishes every trading day at 5 PM ET: what moved and why, each company's sales and profit, how it stacks up against rivals, and one idea you can use. Illustrative content, not real market data.",
  alternates: { canonical: "/brief" },
};

export default function BriefPage() {
  return <SampleBrief />;
}
