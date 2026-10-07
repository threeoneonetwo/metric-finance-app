"use client";

import { ArrowUp, CornerDownRight, Sparkles } from "lucide-react";
import { FormEvent, useEffect, useRef, useState } from "react";
import { trackPostHogEvent } from "@/lib/posthog";
import styles from "./brief-view.module.css";

type Status = "answered" | "advice" | "outside_watchlist" | "unrelated" | "limited" | "unavailable";
type Exchange = { id: number; question: string; answer?: string; status?: Status; error?: string };
type Creds = { token?: string; exp?: string; sig?: string };

const MAX = 300;

// Follow up questions about one brief, answered only from that brief and the reader's own stocks.
export function BriefAsk({ briefingId, tickers, starters, creds }: { briefingId: string; tickers: string[]; starters: string[]; creds: Creds }) {
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [suggestions, setSuggestions] = useState(starters);
  const thread = useRef<HTMLDivElement>(null);
  const nextId = useRef(1);

  useEffect(() => {
    thread.current?.lastElementChild?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [exchanges]);

  async function ask(raw: string) {
    const question = raw.trim();
    if (question.length < 3 || busy || remaining === 0) return;
    const id = nextId.current++;
    // Only real answers are sent back as context, so canned policy replies never shape the next answer.
    const history = exchanges
      .filter((item) => item.status === "answered" && item.answer)
      .slice(-3)
      .flatMap((item) => [
        { role: "user" as const, text: item.question },
        { role: "assistant" as const, text: item.answer! },
      ]);
    setExchanges((items) => [...items, { id, question }]);
    setDraft("");
    setBusy(true);
    trackPostHogEvent("brief_question_submitted", { tickers_count: tickers.length, from_suggestion: suggestions.includes(question) });
    try {
      const response = await fetch("/api/brief/ask", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ briefingId, question, history, ...creds }),
      });
      const data = (await response.json()) as { status?: Status; answer?: string; followUps?: string[]; remaining?: number | null; error?: string };
      if (!response.ok || !data.status) throw new Error(data.error ?? "Something went wrong. Please try again.");
      setExchanges((items) => items.map((item) => (item.id === id ? { ...item, answer: data.answer, status: data.status } : item)));
      if (typeof data.remaining === "number") setRemaining(data.remaining);
      if (data.followUps?.length) setSuggestions(data.followUps);
    } catch (error) {
      setExchanges((items) => items.map((item) => (item.id === id ? { ...item, error: error instanceof Error ? error.message : "Something went wrong." } : item)));
    } finally {
      setBusy(false);
    }
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    void ask(draft);
  }

  const out = remaining === 0;

  return (
    <section className={styles.ask} aria-labelledby="ask-title">
      <div className={styles.askHead}>
        <span className={styles.askIcon} aria-hidden="true"><Sparkles size={18} /></span>
        <div>
          <h2 id="ask-title">Ask about your brief</h2>
          <p>Follow up questions about {tickers.join(", ")}, answered from today&apos;s brief.</p>
        </div>
      </div>

      {exchanges.length > 0 && (
        <div className={styles.thread} ref={thread} aria-live="polite">
          {exchanges.map((item) => (
            <div key={item.id} className={styles.exchange}>
              <p className={styles.q}>{item.question}</p>
              {item.answer ? (
                <div className={`${styles.a} ${item.status !== "answered" ? styles.aNote : ""}`}>
                  {item.answer.split(/\n{2,}/).map((paragraph, index) => <p key={index}>{paragraph}</p>)}
                </div>
              ) : item.error ? (
                <div className={`${styles.a} ${styles.aError}`}><p>{item.error}</p></div>
              ) : (
                <div className={styles.a} aria-label="Writing an answer"><span className={styles.dots}><i /><i /><i /></span></div>
              )}
            </div>
          ))}
        </div>
      )}

      {suggestions.length > 0 && !out && (
        <ul className={styles.suggest} aria-label="Suggested questions">
          {suggestions.map((item) => (
            <li key={item}>
              <button type="button" disabled={busy} onClick={() => void ask(item)}><CornerDownRight size={14} />{item}</button>
            </li>
          ))}
        </ul>
      )}

      <form className={styles.askForm} onSubmit={submit}>
        <label htmlFor="ask-input" className={styles.srOnly}>Ask a question about your brief</label>
        <textarea
          id="ask-input"
          rows={1}
          value={draft}
          maxLength={MAX}
          disabled={out}
          placeholder={out ? "You've used today's questions" : `Ask anything about ${tickers.slice(0, 2).join(" or ")}${tickers.length > 2 ? "…" : ""}`}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              void ask(draft);
            }
          }}
        />
        <button type="submit" disabled={busy || out || draft.trim().length < 3} aria-label="Send question"><ArrowUp size={18} /></button>
      </form>
      <p className={styles.askMeta}>
        <span>Answers explain, they never recommend. They can be wrong, and they are not financial advice.</span>
        {remaining !== null && <span>{remaining} {remaining === 1 ? "question" : "questions"} left today</span>}
      </p>
    </section>
  );
}
