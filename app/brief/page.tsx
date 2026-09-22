import type { Metadata } from "next";
import { BriefContent } from "@/components/brief-content";

export const metadata: Metadata = {
  title: "Today's Brief | Metric Finance",
  description: "Everyone is watching the yield. The story is in the barrel.",
  robots: { index: false, follow: false },
};

export default function BriefPage() {
  return <BriefContent />;
}
