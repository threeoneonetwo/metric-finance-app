"use client";

import { FormEvent, useState } from "react";
import styles from "./newsletter-landing.module.css";

export function RequestManageLink() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const valid = /^\S+@\S+\.\S+$/.test(email.trim());

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!valid) return;
    setStatus("sending");
    try {
      const response = await fetch("/api/manage-link", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      setStatus(response.ok ? "sent" : "error");
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <p className={styles.manageSub} aria-live="polite">
        If <strong>{email.trim()}</strong> is subscribed, we just sent it a private link. It works for 30 days.
      </p>
    );
  }

  return (
    <form onSubmit={submit} noValidate style={{ maxWidth: 560 }}>
      <div className={styles.emailRow}>
        <input
          type="email"
          value={email}
          onChange={(event) => { setEmail(event.target.value); if (status === "error") setStatus("idle"); }}
          placeholder="you@email.com"
          aria-label="Email address"
        />
        <button type="submit" disabled={!valid || status === "sending"}>
          {status === "sending" ? "Sending…" : "Email me the link"}
        </button>
      </div>
      <p className={status === "error" ? styles.error : styles.note}>
        {status === "error" ? "Something went wrong. Please try again in a moment." : "We'll only send a link if this email is subscribed."}
      </p>
    </form>
  );
}
