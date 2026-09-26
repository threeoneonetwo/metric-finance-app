"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MetricWordmark } from "./metric-wordmark";

export function SiteFooter() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    try {
      setToken(localStorage.getItem("mf_token"));
    } catch {
      // localStorage unavailable — links just fall back to the generic manage page.
    }
  }, []);

  const accountHref = token ? `/manage?token=${token}` : "/manage";
  const unsubscribeHref = token ? `/api/unsubscribe?token=${token}` : "/manage";

  return (
    <footer
      className="w-full px-5 pt-10 sm:px-8 lg:px-10"
      style={{
        borderTop: "1px solid rgba(255,255,255,0.06)",
        background: "rgba(15,21,38,0.94)",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-10 sm:flex-row sm:justify-between">
        <div className="max-w-xs">
          <p className="flex items-center gap-2.5 text-lg font-bold text-white">
            <MetricWordmark />
          </p>
          <p className="mt-3 text-sm leading-6 text-[#8993ab]">
            A daily briefing with personalised analysis on your top five US stocks.
          </p>
        </div>

        <div className="flex flex-wrap gap-10 sm:gap-16">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-[#67738f]">Product</p>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link href="/#faq" className="text-[#d7d9dc] transition-colors hover:text-white">FAQ</Link></li>
              <li><Link href={accountHref} className="text-[#d7d9dc] transition-colors hover:text-white">Your account</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-[#67738f]">Legal</p>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link href="/privacy" className="text-[#d7d9dc] transition-colors hover:text-white">Privacy</Link></li>
              <li><Link href="/terms" className="text-[#d7d9dc] transition-colors hover:text-white">Terms</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-[#67738f]">Support</p>
            <ul className="mt-3 space-y-2 text-sm">
              <li><a href="mailto:vanshpandita11@gmail.com" className="text-[#d7d9dc] transition-colors hover:text-white">Contact</a></li>
              <li><a href={unsubscribeHref} className="text-[#d7d9dc] transition-colors hover:text-white">Unsubscribe</a></li>
            </ul>
          </div>
        </div>
      </div>

      <div
        className="mx-auto mt-10 flex max-w-6xl flex-col gap-2 py-5 text-xs text-[#67738f] sm:flex-row sm:items-center sm:justify-between"
        style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
      >
        <p>© {new Date().getFullYear()} Metric Finance</p>
        <p>
          Built by{" "}
          <a href="https://www.linkedin.com/in/yashnapandugala/" target="_blank" rel="noreferrer" className="text-[#8993ab] underline decoration-white/30 underline-offset-4 transition-colors hover:text-white hover:decoration-white">
            Yashna
          </a>
          {" "}&{" "}
          <a href="https://www.linkedin.com/in/vanshpandita-real/" target="_blank" rel="noreferrer" className="text-[#8993ab] underline decoration-white/30 underline-offset-4 transition-colors hover:text-white hover:decoration-white">
            Vansh
          </a>
          {" "}· Not investment advice · Market data may be delayed
        </p>
      </div>
    </footer>
  );
}
