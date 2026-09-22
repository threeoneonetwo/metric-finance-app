"use client";

import { useState } from "react";

export function BriefShareButton() {
  const [shared, setShared] = useState(false);

  async function handleShare() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    } catch {
      // Clipboard unavailable — the button just won't confirm.
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      style={{
        padding: "13px 22px",
        border: "none",
        borderRadius: "10px",
        fontFamily: "Arimo, Arial, sans-serif",
        fontSize: "12px",
        fontWeight: 700,
        letterSpacing: "0.14em",
        cursor: "pointer",
        background: shared ? "#8fd3a8" : "#f2f5fa",
        color: "#05090f",
        transition: "background-color 150ms ease",
      }}
    >
      {shared ? "LINK COPIED" : "SHARE THE TAKE"}
    </button>
  );
}
