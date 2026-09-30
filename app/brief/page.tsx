import type { Metadata } from "next";
import { BriefContent } from "@/components/brief-content";

export const metadata: Metadata = {
  title: "Sample Brief | Metric Finance",
  description: "A sample of the daily briefing Metric Finance sends. Illustrative content, not current market analysis.",
  robots: { index: false, follow: false },
};

export default function BriefPage() {
  return <BriefContent />;
}
