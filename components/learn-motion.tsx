"use client";

import { useEffect, useRef, useState } from "react";
import styles from "@/app/learn/learn.module.css";

// Cursor spotlight: sets --mx and --my on whatever link or card the pointer is over, so CSS can draw a soft glow under it.
export function SpotlightLayer({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={styles.main}
      onPointerMove={(event) => {
        const target = (event.target as HTMLElement).closest<HTMLElement>("a, [data-spot]");
        if (!target) return;
        const box = target.getBoundingClientRect();
        target.style.setProperty("--mx", `${event.clientX - box.left}px`);
        target.style.setProperty("--my", `${event.clientY - box.top}px`);
      }}
    >
      {children}
    </div>
  );
}

// Thin gradient bar at the top of the window that fills as you read an article.
export function ReadingProgress() {
  const bar = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (bar.current) bar.current.style.transform = `scaleX(${max > 0 ? Math.min(1, window.scrollY / max) : 0})`;
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); if (frame) cancelAnimationFrame(frame); };
  }, []);
  return <div className={styles.progress} aria-hidden="true"><div ref={bar} className={styles.progressBar} /></div>;
}

// Counts up to a number the first time it scrolls into view. The real number is in the HTML for crawlers.
export function CountUp({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState(value);
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / 1100);
        setShown(Math.round(value * (1 - Math.pow(1 - t, 3))));
        if (t < 1) frame = requestAnimationFrame(tick);
      };
      setShown(0);
      frame = requestAnimationFrame(tick);
    }, { threshold: 0.6 });
    observer.observe(el);
    return () => { observer.disconnect(); if (frame) cancelAnimationFrame(frame); };
  }, [value]);
  return <span ref={ref}>{shown.toLocaleString("en-US")}{suffix}</span>;
}
