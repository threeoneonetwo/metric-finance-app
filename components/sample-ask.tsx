"use client";

import Link from "next/link";
import { ArrowUp, CornerDownRight, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import styles from "./brief-view.module.css";

// A demo of the follow up box on the sample brief. Every answer is written in advance, so nothing is sent anywhere.
const DEMO: { question: string; answer: string; note?: boolean }[] = [
  {
    question: "Why did NVDA rise today?",
    answer:
      "Nvidia rose 3.1 percent because several of the biggest cloud companies said they will spend more on AI data centers, and much of that money goes to buying Nvidia's chips.\n\nBecause a few huge customers make up a big share of its sales, their plans move expectations for Nvidia quickly. The next real check is its earnings report, where data center revenue will show whether the orders actually grew.",
  },
  {
    question: "What does capex mean for Nvidia?",
    answer:
      "Capex is money a company spends on things that last for years, like data centers. When the cloud companies raise their capex, they are planning to buy more equipment.\n\nNvidia sits on the other side of that spending. One company's capex becomes another company's sales, which is why Nvidia's stock reacts when its customers raise their budgets.",
  },
  {
    question: "Should I buy NVDA after this?",
    note: true,
    answer:
      "I can't tell you whether to buy, sell or hold, or where a price is heading. What I can do is explain what happened, what the numbers mean and what to watch next, so the decision stays yours.",
  },
];

export function SampleAsk() {
  const [shown, setShown] = useState<number[]>([]);
  const [typing, setTyping] = useState<number | null>(null);
  const [nudge, setNudge] = useState(false);
  const thread = useRef<HTMLDivElement>(null);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);
  useEffect(() => {
    thread.current?.lastElementChild?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [shown, typing]);

  function ask(index: number) {
    if (typing !== null || shown.includes(index)) return;
    setTyping(index);
    timer.current = window.setTimeout(() => {
      setShown((items) => [...items, index]);
      setTyping(null);
    }, 900);
  }

  const asked = [...shown, ...(typing !== null ? [typing] : [])];
  const remainingSuggestions = DEMO.map((_, index) => index).filter((index) => !asked.includes(index));

  return (
    <section className={styles.ask} aria-labelledby="sample-ask-title">
      <div className={styles.askHead}>
        <span className={styles.askIcon} aria-hidden="true"><Sparkles size={18} /></span>
        <div>
          <h2 id="sample-ask-title">Ask about your brief</h2>
          <p>Follow up questions about NVDA, TSLA, AAPL, JPM, MSFT, answered from today&apos;s brief. Try one below.</p>
        </div>
      </div>

      {asked.length > 0 && (
        <div className={styles.thread} ref={thread} aria-live="polite">
          {asked.map((index) => (
            <div key={index} className={styles.exchange}>
              <p className={styles.q}>{DEMO[index].question}</p>
              {shown.includes(index) ? (
                <div className={`${styles.a} ${DEMO[index].note ? styles.aNote : ""}`}>
                  {DEMO[index].answer.split("\n\n").map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                </div>
              ) : (
                <div className={styles.a} aria-label="Writing an answer"><span className={styles.dots}><i /><i /><i /></span></div>
              )}
            </div>
          ))}
        </div>
      )}

      {remainingSuggestions.length > 0 && (
        <ul className={styles.suggest} aria-label="Example questions">
          {remainingSuggestions.map((index) => (
            <li key={index}>
              <button type="button" disabled={typing !== null} onClick={() => ask(index)}><CornerDownRight size={14} />{DEMO[index].question}</button>
            </li>
          ))}
        </ul>
      )}

      <form
        className={styles.askForm}
        onSubmit={(event) => {
          event.preventDefault();
          setNudge(true);
        }}
      >
        <label htmlFor="sample-ask-input" className={styles.srOnly}>Ask a question about this sample brief</label>
        <textarea id="sample-ask-input" rows={1} placeholder="Ask anything about your stocks" onFocus={() => setNudge(true)} />
        <button type="submit" aria-label="Send question"><ArrowUp size={18} /></button>
      </form>
      <p className={styles.askMeta}>
        {nudge ? (
          <span>This is a sample. <Link href="/#signup" style={{ color: "#b3c9ff" }}>Build your watchlist</Link> to ask about your own stocks.</span>
        ) : (
          <span>Answers explain, they never recommend. They can be wrong, and they are not financial advice.</span>
        )}
      </p>
    </section>
  );
}
