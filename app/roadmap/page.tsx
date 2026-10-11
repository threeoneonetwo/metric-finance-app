import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { RoadmapBoard } from "@/components/roadmap-board";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import styles from "@/components/roadmap.module.css";
import { getRoadmap } from "@/db/roadmap";
import { isInternalEmail, trackServer } from "@/lib/analytics-server";
import { resolveSubscriber } from "@/lib/session-server";

export const metadata: Metadata = {
  title: "Product Roadmap | Metric Finance",
  robots: { index: false, follow: false },
};

type RoadmapPageProps = { searchParams: Promise<{ token?: string; exp?: string; sig?: string; from?: string }> };

// Members only: readers arrive from the end of their brief or from their dashboard.
export default async function RoadmapPage({ searchParams }: RoadmapPageProps) {
  const { token, exp, sig, from } = await searchParams;
  const { subscriber, creds, staleSession } = await resolveSubscriber({ token, exp, sig });
  if (staleSession) redirect("/api/session/clear?to=/");
  if (!subscriber || !creds) redirect("/");

  const state = await getRoadmap(subscriber.id);
  await trackServer({
    event: "roadmap_viewed",
    distinctId: subscriber.id,
    properties: { internal: isInternalEmail(subscriber.email), source: from === "brief" || from === "dashboard" ? from : "direct", votes_used: state.myVotes.length },
  });

  return (
    <main>
      <div className={styles.page} data-texture="landing">
        <SiteHeader />
        <RoadmapBoard initial={state} creds={creds} />
        <SiteFooter />
      </div>
    </main>
  );
}
