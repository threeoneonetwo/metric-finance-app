"use client";

import { useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import styles from "./newsletter-landing.module.css";
import { StockPicker } from "./stock-picker";
import type { Stock } from "@/lib/stocks";

type ManageWatchlistProps = {
  token: string;
  email: string;
  initialPicks: Stock[];
};

export function ManageWatchlist({ token, email, initialPicks }: ManageWatchlistProps) {
  const [picks, setPicks] = useState<Stock[]>(initialPicks);
  // Baseline of what's actually stored, so "Saved" survives until the next edit.
  const [savedPicks, setSavedPicks] = useState<Stock[]>(initialPicks);
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [error, setError] = useState("");

  const isDirty =
    picks.length !== savedPicks.length ||
    picks.some((pick, index) => pick.symbol !== savedPicks[index]?.symbol);

  async function save() {
    if (picks.length === 0) {
      setError("Keep at least one stock, or unsubscribe if you'd rather stop the briefing.");
      return;
    }

    setStatus("saving");
    setError("");

    try {
      const response = await fetch("/api/watchlist", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token, tickers: picks.map((stock) => stock.symbol) }),
      });

      if (!response.ok) {
        setError("Something went wrong. Please try again in a moment.");
        setStatus("idle");
        return;
      }

      setSavedPicks(picks);
      setStatus("saved");
    } catch {
      setError("Something went wrong. Please try again in a moment.");
      setStatus("idle");
    }
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link href="/" className={styles.logo}>Metric Finance</Link>
      </header>

      <section className={styles.manageSection}>
        <div className={styles.manageInner}>
          <h1 className={styles.manageHeading}>Manage your watchlist</h1>
          <p className={styles.manageSub}>
            Briefings go to <strong>{email}</strong>. Add or remove stocks below, then save.
          </p>

          <div className={styles.signup}>
            <StockPicker
              picks={picks}
              onPicksChange={(next) => { setPicks(next); setError(""); setStatus("idle"); }}
              label="Your watchlist · up to five stocks"
              mobileLabel="Your watchlist"
            />

            <div className={styles.manageActions}>
              <button
                type="button"
                onClick={save}
                disabled={status === "saving" || (!isDirty && status === "saved")}
                className={styles.manageSave}
              >
                {status === "saving" ? "Saving…" : status === "saved" && !isDirty ? "Saved" : "Save watchlist"}
              </button>
            </div>

            {error ? (
              <p className={styles.error}>{error}</p>
            ) : status === "saved" && !isDirty ? (
              <p className={styles.manageSaved} aria-live="polite">
                <Check size={15} /> Your next briefing will use this watchlist.
              </p>
            ) : (
              <p className={styles.note}>Changes take effect from your next briefing.</p>
            )}
          </div>

          <a className={styles.manageUnsubscribe} href={`/api/unsubscribe?token=${token}`}>
            Unsubscribe from the briefing
          </a>
        </div>
      </section>
    </div>
  );
}
