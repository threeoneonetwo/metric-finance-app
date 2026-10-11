"use client";

import { useEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import type { RoadmapIdea, RoadmapState } from "@/db/roadmap";
import styles from "./roadmap.module.css";

const MAX_VOTES = 3;
const MAX_TEXT = 100;
const NEW_DAYS = 7;
const STOP = new Set(["the", "and", "for", "with", "more", "than", "your", "that", "this", "about", "when", "what", "from", "have", "like", "all", "can", "would", "could", "should", "want", "add"]);
const STATUS: Record<RoadmapIdea["status"], { label: string; className: string }> = {
  review: { label: "Under review", className: styles.review },
  planned: { label: "Planned", className: styles.planned },
  progress: { label: "In progress", className: styles.progress },
  shipped: { label: "Shipped", className: styles.shipped },
};

type Creds = { token: string; exp: string; sig: string };

function words(text: string) {
  return text.toLowerCase().split(/[^a-z0-9]+/).filter((word) => word.length >= 3 && !STOP.has(word));
}

function ageLabel(createdAt: string, now: number) {
  const days = Math.floor((now - new Date(createdAt).getTime()) / 86_400_000);
  return days <= 0 ? "Added today" : days === 1 ? "Added yesterday" : `Added ${days} days ago`;
}

function shippedLabel(shippedAt: string) {
  return new Date(shippedAt).toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "UTC" });
}

function spotlight(event: MouseEvent<HTMLElement>) {
  const rect = event.currentTarget.getBoundingClientRect();
  event.currentTarget.style.setProperty("--mx", `${event.clientX - rect.left}px`);
  event.currentTarget.style.setProperty("--my", `${event.clientY - rect.top}px`);
}

export function RoadmapBoard({ initial, creds }: { initial: RoadmapState; creds: Creds }) {
  const [state, setState] = useState(initial);
  const [now] = useState(() => Date.now());
  const [tab, setTab] = useState<"top" | "new">("top");
  const [pending, setPending] = useState<string | null>(null);
  const [pop, setPop] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);
  const [toast, setToast] = useState("");
  const [suggestOpen, setSuggestOpen] = useState(false);
  const [text, setText] = useState("");
  const [sentText, setSentText] = useState("");
  const [sending, setSending] = useState(false);
  const [suggestError, setSuggestError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const used = state.myVotes.length;
  const full = used >= MAX_VOTES;
  const byId = useMemo(() => new Map(state.ideas.map((idea) => [idea.id, idea])), [state.ideas]);

  const list = useMemo(() => {
    if (tab === "top") return [...state.ideas].sort((a, b) => b.votes - a.votes || a.createdAt.localeCompare(b.createdAt));
    const cutoff = now - NEW_DAYS * 86_400_000;
    return state.ideas.filter((idea) => new Date(idea.createdAt).getTime() >= cutoff).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [state.ideas, tab, now]);

  const similar = useMemo(() => {
    const typed = words(text);
    if (!typed.length) return [];
    return state.ideas
      .filter((idea) => {
        const hay = words(`${idea.title} ${idea.description}`);
        return typed.some((word) => hay.some((h) => h.startsWith(word) || (h.length >= 4 && word.startsWith(h))));
      })
      .slice(0, 3);
  }, [text, state.ideas]);

  useEffect(() => {
    if (suggestOpen && !sentText) setTimeout(() => inputRef.current?.focus(), 60);
  }, [suggestOpen, sentText]);

  useEffect(() => {
    if (!suggestOpen) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") setSuggestOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [suggestOpen]);

  function showToast(message: string) {
    clearTimeout(toastTimer.current);
    setToast(message);
    toastTimer.current = setTimeout(() => setToast(""), 2600);
  }

  async function post(payload: Record<string, unknown>) {
    const response = await fetch("/api/roadmap", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, ...creds }),
    });
    const data = (await response.json().catch(() => ({}))) as { state?: RoadmapState; error?: string };
    return { ok: response.ok, ...data };
  }

  async function toggleVote(id: string) {
    if (pending) return;
    const voted = state.myVotes.includes(id);
    if (!voted && full) return showToast("You've used all 3 votes. Take one back to vote for this.");

    // Optimistic: the count and the vote bar update instantly, then the server's answer replaces them.
    const previous = state;
    setState({
      ...state,
      myVotes: voted ? state.myVotes.filter((x) => x !== id) : [...state.myVotes, id],
      ideas: state.ideas.map((idea) => (idea.id === id ? { ...idea, votes: idea.votes + (voted ? -1 : 1) } : idea)),
    });
    if (!voted) {
      setPop(id);
      setTimeout(() => setPop(null), 180);
    }
    setPending(id);
    try {
      const result = await post({ action: voted ? "unvote" : "vote", ideaId: id });
      if (result.state) setState(result.state);
      else setState(previous);
      if (!result.ok) showToast(result.error === "out_of_votes" ? "You've used all 3 votes. Take one back to vote for this." : result.error ?? "Something went wrong. Try again.");
    } catch {
      setState(previous);
      showToast("Something went wrong. Please try again.");
    } finally {
      setPending(null);
    }
  }

  function jump(id: string) {
    const go = () => {
      const element = document.getElementById(`idea-${id}`);
      if (!element) return;
      window.scrollTo({ top: element.getBoundingClientRect().top + window.scrollY - 120, behavior: "smooth" });
      setFlash(id);
      setTimeout(() => setFlash(null), 1400);
    };
    if (tab !== "top") {
      setTab("top");
      setTimeout(go, 60);
    } else go();
  }

  async function submit() {
    const idea = text.replace(/\s+/g, " ").trim();
    if (idea.length < 4 || sending) return;
    setSending(true);
    setSuggestError("");
    try {
      const result = await post({ action: "suggest", text: idea });
      if (result.ok) {
        setSentText(idea);
        setText("");
      } else setSuggestError(result.error ?? "Something went wrong. Try again.");
    } catch {
      setSuggestError("Something went wrong. Please try again.");
    } finally {
      setSending(false);
    }
  }

  function openSuggest() {
    setSentText("");
    setSuggestError("");
    setSuggestOpen(true);
  }

  const dots = Array.from({ length: MAX_VOTES }, (_, index) => index < used);
  const votesLabel = `${used} of ${MAX_VOTES} votes used`;

  return (
    <>
      <div className={styles.hero} aria-hidden="true" />
      <div className={styles.main}>
        <section className={styles.intro}>
          <h1 className={`${styles.title} ${styles.up}`}>
            Help us decide what to <span className={styles.accent}>build next</span>
          </h1>
          <p className={`${styles.lead} ${styles.up}`}>
            You get three votes. Spend them on the ideas you&apos;d use most, and we&apos;ll build the top ones first.
          </p>
        </section>

        <div className={`${styles.votesBar} ${styles.up}`}>
          <div className={styles.votesInner}>
            <div className={styles.votesCount}>
              <span className={styles.label}>Your votes</span>
              <span className={styles.dots}>
                {dots.map((filled, index) => <span key={index} className={filled ? styles.dotOn : styles.dotOff} />)}
              </span>
              <strong>{votesLabel}</strong>
            </div>
            <div className={styles.backed}>
              {state.myVotes.map((id) => {
                const idea = byId.get(id);
                if (!idea) return null;
                return (
                  <span key={id} className={styles.chip}>
                    <button type="button" onClick={() => jump(id)}>{idea.title}</button>
                    <button type="button" aria-label={`Remove your vote for ${idea.title}`} className={styles.chipX} onClick={() => toggleVote(id)}>×</button>
                  </span>
                );
              })}
              {used === 0 && <span className={styles.hint}>Tap the arrow on an idea to vote for it.</span>}
              {full && <span className={styles.hint}>Want to switch? Tap × to take a vote back.</span>}
            </div>
          </div>
        </div>

        <div className={`${styles.controls} ${styles.up}`}>
          <div role="tablist" aria-label="Sort ideas" className={styles.tabs}>
            <button type="button" role="tab" aria-selected={tab === "top"} className={tab === "top" ? styles.tabOn : undefined} onClick={() => setTab("top")}>Top</button>
            <button type="button" role="tab" aria-selected={tab === "new"} className={tab === "new" ? styles.tabOn : undefined} onClick={() => setTab("new")}>New</button>
          </div>
          <button type="button" className={styles.primary} onClick={openSuggest}>Suggest an idea</button>
        </div>

        {list.length > 0 ? (
          <div className={styles.list}>
            {list.map((idea, index) => {
              const voted = state.myVotes.includes(idea.id);
              const dim = full && !voted;
              const status = STATUS[idea.status];
              return (
                <div key={idea.id} id={`idea-${idea.id}`} className={styles.reveal} style={{ animationDelay: `${Math.min(index * 60, 360)}ms` }}>
                  <article className={`${styles.card} ${flash === idea.id ? styles.flash : ""}`} onMouseMove={spotlight}>
                    <div className={styles.cardInner}>
                      <button
                        type="button"
                        aria-pressed={voted}
                        aria-label={voted ? `Remove your vote for ${idea.title}` : `Vote for ${idea.title}`}
                        title={dim ? "Free up a vote to pick this" : undefined}
                        className={`${styles.vote} ${voted ? styles.voted : ""} ${dim ? styles.dim : ""} ${pop === idea.id ? styles.pop : ""}`}
                        onClick={() => toggleVote(idea.id)}
                      >
                        <svg width="14" height="10" viewBox="0 0 14 10" aria-hidden="true">
                          <path d="M7 0L14 10H0z" fill={voted ? "currentColor" : "none"} stroke="currentColor" strokeWidth={voted ? 0 : 1.5} strokeLinejoin="round" />
                        </svg>
                        <span>{idea.votes}</span>
                      </button>
                      <div className={styles.body}>
                        <div className={styles.cardTitle}>
                          <span className={styles.bar} />
                          <h3>{idea.title}</h3>
                        </div>
                        {idea.description && <p>{idea.description}</p>}
                        <div className={styles.tags}>
                          <span className={`${styles.pill} ${status.className}`}>{status.label}</span>
                          {idea.pro && <span className={`${styles.pill} ${styles.pro}`}>PRO</span>}
                          {tab === "new" && <span className={styles.meta}>{ageLabel(idea.createdAt, now)}</span>}
                          {dim && <span className={styles.meta}>Free up a vote to pick this</span>}
                        </div>
                      </div>
                    </div>
                  </article>
                </div>
              );
            })}
          </div>
        ) : (
          <div className={`${styles.card} ${styles.empty}`}>
            <span className={styles.label}>This week</span>
            <h3>Nothing new this week</h3>
            <p>New ideas from readers show up here for a week. Have one? Be the first.</p>
            <button type="button" className={styles.secondary} onClick={openSuggest}>Suggest an idea</button>
          </div>
        )}

        {state.shipped.length > 0 && (
          <section className={`${styles.shippedSection} ${styles.reveal}`}>
            <div className={styles.sectionHead}>
              <span className={styles.bar} />
              <h2>Shipped</h2>
              <span className={styles.label}>You asked, we built</span>
            </div>
            <div className={styles.shippedCard}>
              {state.shipped.map((item) => (
                <div key={item.id} className={styles.shippedRow}>
                  <span className={styles.check}>
                    <svg width="12" height="10" viewBox="0 0 12 10" aria-hidden="true"><path d="M1 5.2L4.3 8.5L11 1.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </span>
                  <div className={styles.shippedText}>
                    <strong>{item.title}</strong>
                    {item.description && <span>{item.description}</span>}
                  </div>
                  {item.shippedAt && <span className={styles.label}>{shippedLabel(item.shippedAt)}</span>}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      <div className={styles.mobileBar}>
        <div className={styles.votesCount}>
          <span className={styles.dots}>
            {dots.map((filled, index) => <span key={index} className={filled ? styles.dotOn : styles.dotOff} />)}
          </span>
          <strong>{votesLabel}</strong>
        </div>
        <button type="button" className={styles.mobileAction} onClick={() => (used ? jump(state.myVotes[0]) : window.scrollTo({ top: 420, behavior: "smooth" }))}>
          {full ? "Change votes" : used ? "See your votes" : "Start voting"}
        </button>
      </div>

      {toast && <div className={styles.toast} role="status">{toast}</div>}

      {suggestOpen && (
        <div className={styles.overlay} onClick={() => setSuggestOpen(false)}>
          <div role="dialog" aria-modal="true" aria-label="Suggest an idea" className={styles.dialog} onClick={(event) => event.stopPropagation()}>
            <button type="button" aria-label="Close" className={styles.close} onClick={() => setSuggestOpen(false)}>×</button>
            {!sentText ? (
              <div className={styles.dialogBody}>
                <span className={`${styles.label} ${styles.labelBlue}`}>Suggest an idea</span>
                <h3>What would make Metric Finance better for you?</h3>
                <div className={styles.field}>
                  <input
                    ref={inputRef}
                    value={text}
                    maxLength={MAX_TEXT}
                    placeholder="Tell us in a sentence"
                    onChange={(event) => setText(event.target.value.slice(0, MAX_TEXT))}
                    onKeyDown={(event) => { if (event.key === "Enter") submit(); }}
                  />
                  <span className={styles.count}>{text.length} / {MAX_TEXT}</span>
                </div>
                {similar.length > 0 && (
                  <div className={styles.similar}>
                    <span className={styles.label}>These look similar. Vote instead?</span>
                    {similar.map((idea) => {
                      const voted = state.myVotes.includes(idea.id);
                      return (
                        <div key={idea.id} className={styles.similarRow}>
                          <span className={styles.bullet} />
                          <span className={styles.similarTitle}>{idea.title}</span>
                          <button type="button" className={voted ? styles.similarOn : undefined} onClick={() => toggleVote(idea.id)}>{voted ? "Voted" : "Vote"}</button>
                        </div>
                      );
                    })}
                  </div>
                )}
                {suggestError && <p className={styles.error}>{suggestError}</p>}
                <div className={styles.dialogActions}>
                  <button type="button" className={styles.secondary} onClick={() => setSuggestOpen(false)}>Cancel</button>
                  <button type="button" className={styles.primary} disabled={text.trim().length < 4 || sending} onClick={submit}>{sending ? "Sending" : "Send idea"}</button>
                </div>
              </div>
            ) : (
              <div className={styles.sent}>
                <span className={styles.sentIcon}>
                  <svg width="20" height="16" viewBox="0 0 12 10" aria-hidden="true"><path d="M1 5.2L4.3 8.5L11 1.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </span>
                <h3>Thanks for the idea</h3>
                <p>We read every one. If it fits, you&apos;ll see it on the board soon.</p>
                <p className={styles.quote}>&ldquo;{sentText}&rdquo;</p>
                <button type="button" className={styles.primary} onClick={() => setSuggestOpen(false)}>Back to the board</button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
