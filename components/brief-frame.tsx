"use client";

import { useEffect, useRef } from "react";
import styles from "./brief-view.module.css";

// Shows the saved brief inside a locked down frame: no scripts run, links open in a new tab.
export function BriefFrame({ html, title }: { html: string; title: string }) {
  const frame = useRef<HTMLIFrameElement>(null);
  const doc = html.replace("<head>", '<head><base target="_blank">');

  useEffect(() => {
    const el = frame.current;
    if (!el) return;
    let observer: ResizeObserver | undefined;

    const fit = () => {
      const root = el.contentDocument?.documentElement;
      if (root) el.style.height = `${root.scrollHeight}px`;
    };
    // The frame can finish loading before React attaches, so also fit once straight away.
    const onLoad = () => {
      fit();
      observer?.disconnect();
      const body = el.contentDocument?.body;
      if (body) {
        observer = new ResizeObserver(fit);
        observer.observe(body);
      }
    };

    el.addEventListener("load", onLoad);
    onLoad();
    return () => {
      el.removeEventListener("load", onLoad);
      observer?.disconnect();
    };
  }, [html]);

  return (
    <iframe
      ref={frame}
      title={title}
      srcDoc={doc}
      sandbox="allow-same-origin allow-popups allow-popups-to-escape-sandbox"
      className={styles.frame}
    />
  );
}
