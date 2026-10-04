"use client";

import { useState } from "react";
import { trackPostHogEvent } from "@/lib/posthog";
import styles from "./brief-view.module.css";

const SITE = "https://metricfinance.app";
const MESSAGE = "I get a free daily brief that explains my stocks like I'm 5. Try it:";

type Channel = "native" | "copy" | "whatsapp" | "sms" | "x";

// Shares the public homepage, never the brief itself, because brief links are personal and signed.
export function ShareCard({ page }: { page: "brief" }) {
  const [copied, setCopied] = useState(false);
  const link = (channel: Channel) => `${SITE}/?ref=share_${channel}`;
  const track = (channel: Channel) => trackPostHogEvent("share_clicked", { channel, page });

  async function share() {
    track("native");
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: "Metric Finance", text: MESSAGE, url: link("native") });
        return;
      } catch {
        return;
      }
    }
    await copy();
  }

  async function copy() {
    track("copy");
    try {
      await navigator.clipboard.writeText(link("copy"));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard can be blocked; the other buttons still work.
    }
  }

  const text = (channel: Channel) => encodeURIComponent(`${MESSAGE} ${link(channel)}`);

  return (
    <section className={styles.share} aria-label="Share Metric Finance">
      <h2>Know someone who&apos;d like this?</h2>
      <p>Metric Finance is free. Send a friend the link so they can get their own daily brief.</p>
      <div className={styles.shareButtons}>
        <button type="button" className={styles.primary} onClick={share}>Share</button>
        <button type="button" onClick={copy}>{copied ? "Copied" : "Copy link"}</button>
        <a href={`https://wa.me/?text=${text("whatsapp")}`} target="_blank" rel="noopener noreferrer" onClick={() => track("whatsapp")}>WhatsApp</a>
        <a href={`sms:?&body=${text("sms")}`} onClick={() => track("sms")}>Message</a>
        <a href={`https://twitter.com/intent/tweet?text=${text("x")}`} target="_blank" rel="noopener noreferrer" onClick={() => track("x")}>X</a>
      </div>
    </section>
  );
}
