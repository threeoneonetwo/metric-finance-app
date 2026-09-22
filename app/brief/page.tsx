import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Arimo } from "next/font/google";
import { BriefChart } from "@/components/brief-chart";
import { BriefShareButton } from "@/components/brief-share-button";
import { SiteFooter } from "@/components/site-footer";

const arimo = Arimo({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });

export const metadata: Metadata = {
  title: "Today's Brief | Metric Finance",
  description: "Everyone is watching the yield. The story is in the barrel.",
  robots: { index: false, follow: false },
};

const TAGS = {
  bull: { tag: "TAILWIND", tagColor: "#8fd3a8", tagBorder: "#22402f", tagBg: "#0f1d16" },
  bear: { tag: "PRESSURE", tagColor: "#ff9aa8", tagBorder: "#4a2230", tagBg: "#1c1016" },
  flat: { tag: "WATCH", tagColor: "#9db3dd", tagBorder: "#1e2b49", tagBg: "#101a2e" },
} as const;

const METRICS = [
  { label: "WTI CRUDE", value: "$100.40", delta: "+3.8% this week", color: "#ff9aa8" },
  { label: "10-YEAR YIELD", value: "5.02%", delta: "+18bp overnight", color: "#ff9aa8" },
  { label: "SOX SEMIS", value: "−5.6%", delta: "Worst session since May", color: "#ff9aa8" },
  { label: "S&P 500", value: "−1.2%", delta: "Breadth still positive", color: "#8fd3a8" },
];

const PORTFOLIO = [
  { label: "DATA-CENTRE CAPEX EXPOSURE", value: "5 of 5", note: "Every name sits downstream of the same cycle" },
  { label: "CAN PASS ON INPUT COSTS", value: "4 of 5", note: "AMZN is the exception" },
  { label: "WEEK VERSUS THE S&P", value: "−2.9pts", note: "Your five −4.1%, index −1.2%" },
  { label: "REPORTING IN 3 DAYS", value: "AAPL", note: "The only print in the list this week" },
];

const PICKS = [
  {
    ticker: "NVDA", name: "NVIDIA Corporation", kind: "bull" as const,
    headline: "Sold off with the group, on a reason that has nothing to do with the company.",
    note: "Down 5.6% in line with the SOX, which is the tell: there was no company-specific news in the session, no estimate revisions, and no change to the order book anyone can point to. The group trades as a duration asset when the long end moves, and it moved.",
    note2: "Meanwhile supply commentary out of two Asian assemblers still points to data-centre orders holding through the quarter. That does not change the thesis you hold the name on, but it does raise the bar for next month's guide: a hold-the-line quarter now reads as a disappointment rather than a confirmation.",
    invalidate: "Any hint that hyperscaler capex plans are being pushed a quarter to the right.",
    level: "$118",
  },
  {
    ticker: "AAPL", name: "Apple Inc.", kind: "flat" as const,
    headline: "Services is the only line that matters on Thursday.",
    note: "Hardware carried the last two prints, and the market gave it credit for that at a multiple that assumes services keeps compounding alongside. If services growth slows to single digits, that multiple is hard to defend at these levels regardless of what the iPhone line does.",
    note2: "The setup going in is unusually quiet: implied vol into the print is below where it sat for either of the last two quarters, which means the market is not positioned for a surprise in either direction. That tends to make the reaction larger, not smaller.",
    invalidate: "Services growth under 10% year on year, or soft December guidance.",
    level: "$212",
  },
  {
    ticker: "AMZN", name: "Amazon.com, Inc.", kind: "bear" as const,
    headline: "The one name in your five with direct fuel exposure and the least room to pass it on.",
    note: "Crude at $100 is a logistics cost line here, not a macro talking point. Fulfilment and last-mile are the largest single cost bucket in the retail segment, and the contracts that absorb fuel repricing roll on a quarterly basis, which means this shows up in reported numbers next quarter rather than this one.",
    note2: "Retail pricing power is the offset, and it is thinner than it was two years ago. AWS margin can carry the consolidated number for a quarter or two, but the market has been paying for retail margin expansion specifically, and that is the line at risk.",
    invalidate: "Crude back under $85, or a retail take-rate increase that sticks.",
    level: "$186",
  },
  {
    ticker: "META", name: "Meta Platforms, Inc.", kind: "bull" as const,
    headline: "Ad pricing is the cleanest pass-through story in your list.",
    note: "Price per ad has risen in each of the last three quarters while impressions grew, which is the combination that says pricing power rather than volume. In an input-cost environment that is the characteristic you want, and it is the third time this year that rate-driven selling has ignored it.",
    note2: "The capex line is the honest counterargument. Spending guidance keeps moving up, and at some point the market stops treating it as investment and starts treating it as a structural margin cost. That debate is not resolved this week, but it is the thing to watch into the next print.",
    invalidate: "A second consecutive quarter of capex guidance revised higher.",
    level: "$580",
  },
  {
    ticker: "GOOGL", name: "Alphabet Inc.", kind: "flat" as const,
    headline: "Cloud growth against capex is the whole debate, and nothing this week settles it.",
    note: "Cloud has been accelerating off a smaller base than the market gives it credit for, but the capex required to sustain that acceleration is now large enough to matter at the consolidated level. Bulls and bears are looking at the same two numbers and reaching opposite conclusions.",
    note2: "Absent a catalyst, expect it to trade with the index rather than on news, which in a rotation week means it underperforms the names being bought and outperforms the ones being sold. Not a position to add to here; not a reason to trim either.",
    invalidate: "Cloud growth decelerating while capex guidance holds.",
    level: "$164",
  },
].map((p) => ({ ...p, mono: p.ticker.slice(0, 2), ...TAGS[p.kind] }));

const CATALYSTS = [
  { when: "THU 4:30PM", ticker: "AAPL", what: "Q4 earnings", why: "Services growth is the number and December guidance matters more than the print. Implied vol into it is below the last two quarters, so the reaction is likely to be outsized." },
  { when: "WED 2:00PM", ticker: "MACRO", what: "Fed minutes", why: "Watch the language on the pace of cuts rather than the cuts themselves. Any acknowledgement of input-cost pressure is the line that reprices the industrials." },
  { when: "FRI 8:30AM", ticker: "MACRO", what: "Core PCE", why: "A hot number keeps the 10-year above 5% and the pressure on semis for another week. A cool one turns this morning's selloff into an entry." },
  { when: "TECHNICAL", ticker: "NVDA", what: "$118 support", why: "The level has held twice since August, both times on heavier volume than the approach. It is the line the tape is testing, and a clean break changes the character of the group's selloff." },
];

const WTI_HERO = [76.2, 75.8, 77.1, 78.4, 77.9, 79.2, 80.1, 79.6, 81.3, 82.0, 83.4, 82.8, 84.1, 85.6, 86.2, 85.4, 87.1, 88.3, 89.0, 90.2, 91.5, 92.1, 93.8, 94.6, 93.9, 95.2, 96.4, 97.1, 98.5, 100.40];
const WTI_12MO = [78.2, 76.5, 74.1, 79.8, 83.2, 80.6, 85.4, 89.1, 91.7, 88.3, 94.9, 100.40];
const SOX_INDEXED = [100, 104.2, 109.6, 115.3, 121.4, 118.7, 125.9, 130.2, 128.6, 122.1, 118.4, 112.5];
const TENYR_INDEXED = [100, 100.5, 101.2, 100.8, 102.1, 103.6, 104.2, 105.1, 106.4, 107.2, 108.6, 110.3];
const TAKE_SEMIS = [100, 103, 108, 112, 109, 105, 101, 96, 92, 89, 85, 84];
const TAKE_INDUSTRIALS = [100, 100.8, 101.5, 101.2, 100.6, 99.8, 99.1, 98.7, 98.9, 98.3, 97.8, 97.5];

const sectionLabel: CSSProperties = {
  fontSize: "12px", fontWeight: 700, letterSpacing: "0.16em", color: "#8798b4",
  paddingBottom: "12px", borderBottom: "1px solid #16203a", marginBottom: "22px",
};
const bodyP: CSSProperties = { margin: "0 0 18px", fontSize: "17px", lineHeight: 1.75, color: "#dbe4f2" };

export default function BriefPage() {
  return (
    <div className={arimo.className} style={{ minHeight: "100vh", background: "#04070d", color: "#f2f5fa" }}>
      <style>{`
        .brief-header { flex-wrap: wrap; padding: 20px 24px !important; }
        .brief-header a.brief-logo { font-size: 20px !important; }
        .brief-header nav { gap: 20px !important; }
        @media (min-width: 640px) {
          .brief-header { padding: 26px 40px !important; }
          .brief-header a.brief-logo { font-size: 26px !important; }
          .brief-header nav { gap: 32px !important; }
        }
      `}</style>
      <header className="brief-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "24px", background: "#0b1120", borderBottom: "1px solid #16203a" }}>
        <Link href="/" className="brief-logo" style={{ fontWeight: 800, letterSpacing: "-0.8px", color: "#f2f5fa" }}>Metric Finance</Link>
        <nav style={{ display: "flex", alignItems: "center" }}>
          <Link href="/brief" style={{ fontSize: "15px", fontWeight: 600, color: "#e6ecf7" }}>Briefings</Link>
          <Link href="/manage" style={{ fontSize: "15px", fontWeight: 600, color: "#e6ecf7" }}>Watchlist</Link>
        </nav>
      </header>

      <main style={{ maxWidth: "860px", margin: "0 auto", padding: "56px 32px 96px" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", alignItems: "baseline", justifyContent: "space-between", marginBottom: "12px" }}>
          <div style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.16em", color: "#8798b4" }}>TUESDAY · SEP 22 · PRE-OPEN</div>
          <div style={{ fontSize: "13px", color: "#8798b4" }}>7 min read</div>
        </div>
        <h1 style={{ margin: "0 0 28px", fontSize: "42px", lineHeight: 1.08, fontWeight: 700, letterSpacing: "-1.6px", maxWidth: "26ch" }}>
          Everyone is watching the yield. The story is in the barrel.
        </h1>

        <div style={{ borderRadius: "14px", overflow: "hidden", border: "1px solid #16203a", marginBottom: "44px" }}>
          <BriefChart label="WTI crude, last 30 sessions" height={320} series={[{ points: WTI_HERO, color: "#ff9aa8", fill: true }]} />
        </div>

        <section>
          <div style={sectionLabel}>SETUP</div>
          <p style={bodyP}>The 10-year crossing 5% is the headline every desk led with this morning, and it is the reason the semis sold off 5.6% into the close. That part is consensus. It was in the tape by 11am and it is in the price now.</p>
          <p style={bodyP}>The part that isn&apos;t: crude back at $100 does more damage to the margin lines in your watchlist over the next two quarters than another 50bp on the long end. The mechanism is different and the market keeps conflating them. Rates compress the multiple once, immediately, and then the effect is done until the next repricing. Input costs compress earnings every quarter until the input costs come down, and they show up in reported numbers on a two-to-three-quarter lag.</p>
          <p style={{ ...bodyP, marginBottom: 0 }}>So the selloff you are looking at this morning is a multiple event in names whose earnings are fine, sitting alongside a cost event in names whose multiples have not moved at all. That is the asymmetry worth acting on.</p>
        </section>

        <section style={{ marginTop: "48px" }}>
          <div style={sectionLabel}>THE NUMBERS</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", border: "1px solid #16203a", borderRadius: "14px", overflow: "hidden", background: "#0a101d", marginBottom: "20px" }}>
            {METRICS.map((m) => (
              <div key={m.label} style={{ padding: "20px 22px", borderLeft: "1px solid #16203a", marginLeft: "-1px" }}>
                <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.14em", color: "#8798b4", marginBottom: "12px" }}>{m.label}</div>
                <div style={{ fontSize: "26px", fontWeight: 700, letterSpacing: "-0.9px", marginBottom: "8px" }}>{m.value}</div>
                <div style={{ fontSize: "13px", fontWeight: 600, color: m.color }}>{m.delta}</div>
              </div>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px", marginBottom: "20px" }}>
            <div>
              <div style={{ borderRadius: "12px", overflow: "hidden", border: "1px solid #16203a" }}>
                <BriefChart label="WTI crude, trailing twelve months" height={190} series={[{ points: WTI_12MO, color: "#ff9aa8", fill: true }]} />
              </div>
              <div style={{ marginTop: "8px", fontSize: "12px", color: "#8798b4" }}>WTI crude, trailing twelve months</div>
            </div>
            <div>
              <div style={{ borderRadius: "12px", overflow: "hidden", border: "1px solid #16203a" }}>
                <BriefChart
                  label="SOX against the 10-year, indexed"
                  height={190}
                  series={[{ points: SOX_INDEXED, color: "#8fb0ff" }, { points: TENYR_INDEXED, color: "#ff9aa8" }]}
                />
              </div>
              <div style={{ marginTop: "8px", fontSize: "12px", color: "#8798b4" }}>SOX (blue) against the 10-year (red), indexed to 100</div>
            </div>
          </div>
          <p style={{ ...bodyP, marginBottom: 0 }}>Two things in those numbers are worth separating. Breadth held positive while the index fell 1.2%, which tells you this was a sector rotation and not a de-risking event. And crude&apos;s 3.8% move came on supply news, not demand news, which is the version of a spike that tends to hold.</p>
        </section>

        <section style={{ marginTop: "48px" }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "baseline", justifyContent: "space-between", paddingBottom: "12px", borderBottom: "1px solid #16203a", marginBottom: "22px" }}>
            <div style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.16em", color: "#8798b4" }}>YOUR FIVE</div>
            <div style={{ fontSize: "13px", color: "#8798b4" }}>The portfolio first, then each name</div>
          </div>

          <div style={{ border: "1px solid #27365a", borderRadius: "14px", background: "#0c1322", padding: "26px 24px", marginBottom: "24px" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.14em", color: "#8fb0ff", marginBottom: "16px" }}>AS A PORTFOLIO</div>
            <p style={{ margin: "0 0 16px", fontSize: "16px", lineHeight: 1.75, color: "#dbe4f2" }}>Your five are not five independent bets. Four of them monetise the same thing — advertising and cloud spend from a shortlist of large enterprise buyers — and all five sit downstream of the same data-centre capex cycle. On a day like today they move together because they are, functionally, one position with a semiconductor hedge attached.</p>
            <p style={{ margin: "0 0 20px", fontSize: "16px", lineHeight: 1.75, color: "#dbe4f2" }}>That is fine when the cycle runs. It is the thing to understand when it doesn&apos;t: the diversification you have is by business model, not by driver. The one genuine differentiator in the list is AMZN, and it differs in the direction you would not choose — it carries the fuel exposure without the pricing power the other four have.</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", border: "1px solid #1e2b49", borderRadius: "11px", overflow: "hidden", background: "#0a101d" }}>
              {PORTFOLIO.map((p) => (
                <div key={p.label} style={{ padding: "16px 18px", borderLeft: "1px solid #1e2b49", marginLeft: "-1px" }}>
                  <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.14em", color: "#8798b4", marginBottom: "10px" }}>{p.label}</div>
                  <div style={{ fontSize: "20px", fontWeight: 700, letterSpacing: "-0.6px", marginBottom: "6px" }}>{p.value}</div>
                  <div style={{ fontSize: "12px", lineHeight: 1.45, color: "#8798b4" }}>{p.note}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {PICKS.map((p) => (
              <div key={p.ticker} style={{ border: "1px solid #16203a", borderRadius: "14px", background: "#0a101d", overflow: "hidden" }}>
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "12px", padding: "18px 22px", borderBottom: "1px solid #111a2e", background: "#0c1322" }}>
                  <div style={{ flex: "none", width: "34px", height: "34px", borderRadius: "9px", background: "#131e34", border: "1px solid #1e2b49", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 700, color: "#9db3dd" }}>{p.mono}</div>
                  <div style={{ fontSize: "15px", fontWeight: 700, letterSpacing: "0.04em" }}>{p.ticker}</div>
                  <div style={{ flex: 1, minWidth: "120px", fontSize: "13px", color: "#8798b4", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</div>
                  <span style={{ flex: "none", fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em", color: p.tagColor, border: `1px solid ${p.tagBorder}`, background: p.tagBg, borderRadius: "5px", padding: "5px 9px" }}>{p.tag}</span>
                </div>
                <div style={{ padding: "20px 22px" }}>
                  <div style={{ fontSize: "16px", fontWeight: 700, lineHeight: 1.4, marginBottom: "12px" }}>{p.headline}</div>
                  <p style={{ margin: "0 0 14px", fontSize: "15px", lineHeight: 1.7, color: "#c3cfe4" }}>{p.note}</p>
                  <p style={{ margin: "0 0 16px", fontSize: "15px", lineHeight: 1.7, color: "#c3cfe4" }}>{p.note2}</p>
                  <div style={{ display: "flex", flexWrap: "wrap", border: "1px solid #16203a", borderRadius: "10px", overflow: "hidden" }}>
                    <div style={{ flex: 1, minWidth: "120px", padding: "12px 16px", borderLeft: "1px solid #16203a", marginLeft: "-1px" }}>
                      <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.14em", color: "#8798b4", marginBottom: "6px" }}>WHAT WOULD CHANGE IT</div>
                      <div style={{ fontSize: "13px", lineHeight: 1.5, color: "#dbe4f2" }}>{p.invalidate}</div>
                    </div>
                    <div style={{ flex: "none", padding: "12px 16px", borderLeft: "1px solid #16203a" }}>
                      <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.14em", color: "#8798b4", marginBottom: "6px" }}>LEVEL</div>
                      <div style={{ fontSize: "13px", fontWeight: 700, color: "#dbe4f2" }}>{p.level}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section style={{ marginTop: "48px" }}>
          <div style={sectionLabel}>CATALYSTS</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {CATALYSTS.map((c) => (
              <div key={`${c.when}-${c.ticker}`} style={{ padding: "18px 20px", border: "1px solid #16203a", borderRadius: "11px", background: "#0a101d" }}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "14px", alignItems: "baseline", marginBottom: "10px" }}>
                  <div style={{ flex: "none", fontSize: "12px", fontWeight: 700, letterSpacing: "0.1em", color: "#7aa2ff" }}>{c.when}</div>
                  <div style={{ flex: "none", fontSize: "14px", fontWeight: 700, letterSpacing: "0.04em" }}>{c.ticker}</div>
                  <div style={{ flex: 1, minWidth: "180px", fontSize: "15px", fontWeight: 600, lineHeight: 1.5, color: "#f2f5fa" }}>{c.what}</div>
                </div>
                <p style={{ margin: 0, fontSize: "14px", lineHeight: 1.65, color: "#8798b4" }}>{c.why}</p>
              </div>
            ))}
          </div>
        </section>

        <section style={{ marginTop: "48px", border: "1px solid #27365a", borderRadius: "14px", background: "#0c1322", overflow: "hidden" }}>
          <div style={{ borderBottom: "1px solid #27365a" }}>
            <BriefChart
              label="Semis (red) vs industrials (blue), indexed — the divergence the take is about"
              height={200}
              series={[{ points: TAKE_SEMIS, color: "#ff9aa8" }, { points: TAKE_INDUSTRIALS, color: "#8fb0ff" }]}
            />
          </div>
          <div style={{ padding: "32px 30px" }}>
            <div style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.16em", color: "#8fb0ff", marginBottom: "18px" }}>THE TAKE</div>
            <p style={{ margin: "0 0 18px", fontSize: "22px", lineHeight: 1.5, fontWeight: 700, letterSpacing: "-0.5px" }}>If oil holds $100 into November, the semis selloff will look like the buying opportunity and the industrials will look like the trap.</p>
            <p style={{ margin: "0 0 16px", fontSize: "16px", lineHeight: 1.75, color: "#a9b8d1" }}>Semis are being repriced on a rate move that is nearly done. Another 50bp on the long end takes maybe two turns off the group&apos;s multiple, and the market has already taken most of that in two sessions. The earnings estimates behind those multiples have not moved.</p>
            <p style={{ margin: 0, fontSize: "16px", lineHeight: 1.75, color: "#a9b8d1" }}>The freight and input exposure sitting in the industrial and logistics names is being repriced on nothing at all, because the market is still treating $100 crude as a spike rather than a level. Four of your five names have the pricing power to pass it through. One does not, and it is the one that has fallen least. That is the trade the desk is not making yet.</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "26px" }}>
              <BriefShareButton />
              <button
                type="button"
                style={{ padding: "13px 22px", border: "1px solid #27365a", borderRadius: "10px", background: "transparent", color: "#cddcf7", fontFamily: "Arimo, Arial, sans-serif", fontSize: "12px", fontWeight: 700, letterSpacing: "0.14em", cursor: "pointer" }}
              >
                SAVE TO ARCHIVE
              </button>
            </div>
          </div>
        </section>

        <div style={{ marginTop: "40px", fontSize: "13px", lineHeight: 1.6, color: "#8798b4" }}>
          Sent to vanshpandita11@gmail.com · <Link href="/manage" style={{ borderBottom: "1px solid #2a3552", color: "#8798b4" }}>Change your watchlist</Link>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
