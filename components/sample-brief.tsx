import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { RoadmapLinkDemo } from "./roadmap-link";
import { SampleAsk } from "./sample-ask";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";
import { SpotGlow } from "./spot-glow";
import styles from "./sample-brief.module.css";

const SHOWCASE_WATCHLIST = [
  { ticker: "NVDA", change: "+3.1%", up: true, signal: "Big customers are spending more on AI chips" },
  { ticker: "TSLA", change: "-2.4%", up: false, signal: "Fewer cars delivered than hoped" },
  { ticker: "AAPL", change: "+1.2%", up: true, signal: "Subscriptions keep growing" },
  { ticker: "JPM", change: "-0.6%", up: false, signal: "Waiting on interest rate news" },
  { ticker: "MSFT", change: "+0.4%", up: true, signal: "Nothing material today" },
] as const;

const SHOWCASE_LEAD = [
  ["What happened.", "Several of the biggest cloud companies raised how much they plan to spend on AI data centers, and a big chunk of that money goes to buying Nvidia's chips."],
  ["Why it matters.", "Nvidia sells to a small group of huge customers, so when they spend more, its sales can jump. Picture a pizza shop that just learned the three biggest offices in town are ordering for every meeting."],
  ["What it changes.", "Expectations for Nvidia's sales over the next few quarters went up. Stock prices lean on the future, so anything that makes that future look bigger moves the price today."],
  ["What it doesn't prove.", "That the spending will pay off for those customers, or that it lasts. Plans can change fast."],
  ["Next checkpoint.", "Nvidia's next earnings report, when we see if orders really grew."],
] as const;

const SHOWCASE_REST = [
  { ticker: "TSLA", change: "-2.4%", up: false, text: "Tesla slipped after delivering fewer cars than analysts hoped. One quarter is a snapshot, not the whole story, but it puts pressure on the next report to show a rebound." },
  { ticker: "AAPL", change: "+1.2%", up: true, text: "Apple edged up as its subscription business keeps growing. Subscriptions bring in steady, repeat money, which investors like more than one big gadget sale. Nothing here changes the bigger picture." },
  { ticker: "JPM", change: "-0.6%", up: false, text: "JPMorgan dipped while investors waited on interest rate news. Rates change how much banks earn on loans, so bank stocks tend to wobble before big announcements. Just waiting, nothing broke." },
  { ticker: "MSFT", change: "+0.4%", up: true, text: "Quiet day. Nothing material." },
] as const;

// The business behind each stock: numbers from the latest quarterly report, read in plain words.
const SHOWCASE_BUSINESS = [
  { ticker: "NVDA", period: "Quarter ended Jul 26", stats: [["Sales", "$96.2B"], ["vs a year ago", "+56%"], ["Profit margin", "62%"], ["Cash", "$22.4B"], ["Debt", "$33.4B"]], text: "Nvidia sold about 96 billion dollars of stuff in its latest quarter, way more than a year ago, and kept about 62 cents of every dollar as profit. That is unusually high for any company." },
  { ticker: "TSLA", period: "Quarter ended Sep 30", stats: [["Sales", "$28.0B"], ["vs a year ago", "0%"], ["Profit margin", "3%"], ["Cash", "$17.9B"], ["Debt", "$8.0B"]], text: "Tesla's sales were flat against a year ago and it kept about 3 cents of every dollar as profit. Thin, but it holds more than twice as much cash as debt." },
  { ticker: "AAPL", period: "Quarter ended Sep 26", stats: [["Sales", "$114.5B"], ["vs a year ago", "+12%"], ["Profit margin", "27%"], ["Cash", "$36.3B"], ["Debt", "$78.1B"]], text: "Apple grew sales about 12 percent and kept 27 cents of every dollar. It carries more debt than cash, which big steady earners often do on purpose because borrowing is cheap for them." },
] as const;

// How each stock compares with the biggest companies in its industry.
const SHOWCASE_RIVALS = [
  {
    ticker: "NVDA",
    rows: [["NVDA", "+3.1%", true, "+56%", "62%"], ["AVGO", "+1.4%", true, "+22%", "35%"], ["AMD", "+0.9%", true, "+32%", "12%"], ["MU", "+2.2%", true, "+46%", "28%"]],
    text: "The whole chip group rose, but Nvidia rose the most. It is also growing faster and keeping more of each dollar than its biggest rivals, which is why the AI spending news hit it hardest.",
  },
  {
    ticker: "TSLA",
    rows: [["TSLA", "-2.4%", false, "0%", "3%"], ["GM", "+0.3%", true, "+4%", "5%"], ["F", "+0.1%", true, "+2%", "3%"]],
    text: "Tesla fell while other carmakers barely moved, so this was a Tesla story, not an industry one. Its margin now looks a lot like the old carmakers it used to beat easily.",
  },
] as const;

export function SampleBrief() {
  return (
    <div className={styles.page}>
      <SiteHeader />
      <SpotGlow>
      <main className={styles.main}>
        <div className={styles.intro}>
          <span className={styles.kicker}>Sample brief</span>
          <h1>Your next favourite daily brief</h1>
          <p>One bite sized brief, posted on the site every trading day at 5 PM ET, explaining everything about your stocks, what moved, and why, in words anyone can follow. Still curious? Ask follow up questions right inside the brief. We email you when it is up.</p>
        </div>

        <figure className={styles.mailFrame} aria-label="Example of a Metric Finance daily brief">
          <div className={styles.mailBar} aria-hidden="true">
            <span /><span /><span />
            <em>metricfinance.app/brief</em>
          </div>
          <div className={styles.mailMeta}>
            <div className={styles.mailFrom}><strong>Today&apos;s brief</strong><span>Posted at 5:00 PM ET</span></div>
            <div className={styles.mailSubject}>Chip stocks had a day. Here&apos;s why.</div>
          </div>
          <div className={styles.mailBody}>
            <div className={styles.mailSection}>
              <div className={styles.mailLabel}>Today in one sentence</div>
              <p className={styles.mailLead}>Chip stocks had the big day after cloud giants said they will spend more on AI hardware. Nvidia jumped while the rest of your list barely moved, so this was a sector story, not a market wide one.</p>
            </div>

            <div className={styles.mailSection}>
              <div className={styles.mailLabel}>Your watchlist</div>
              {SHOWCASE_WATCHLIST.map((row) => (
                <div className={styles.mailGlance} key={row.ticker}>
                  <span className={styles.mailTicker}>{row.ticker}</span>
                  <span className={row.up ? styles.mailUp : styles.mailDown}>{row.change}</span>
                  <span className={styles.mailSignal}>{row.signal}</span>
                </div>
              ))}
            </div>

            <div className={styles.mailSection}>
              <div className={styles.mailLabel}>The one change worth understanding</div>
              <h3 className={styles.mailStoryTitle}>Nvidia jumped because its biggest customers are spending more</h3>
              {SHOWCASE_LEAD.map(([lead, text]) => (
                <p className={styles.mailStory} key={lead}><strong>{lead}</strong> {text}</p>
              ))}
            </div>

            <div className={styles.mailSection}>
              <div className={styles.mailLabel}>The rest of your stocks</div>
              {SHOWCASE_REST.map((row) => (
                <div className={styles.mailRest} key={row.ticker}>
                  <div className={styles.mailRestTop}>
                    <span className={styles.mailTicker}>{row.ticker}</span>
                    <span className={row.up ? styles.mailUp : styles.mailDown}>{row.change}</span>
                  </div>
                  <p>{row.text}</p>
                </div>
              ))}
            </div>

            {/* The business behind each stock: the latest quarterly numbers in plain words. */}
            <div className={styles.mailSection}>
              <div className={styles.mailLabel}>The business behind your stocks</div>
              {SHOWCASE_BUSINESS.map((row) => (
                <div className={styles.mailRest} key={row.ticker}>
                  <div className={styles.mailRestTop}>
                    <span className={styles.mailTicker}>{row.ticker}</span>
                    <span className={styles.mailPeriod}>{row.period}</span>
                  </div>
                  <div className={styles.mailStats}>
                    {row.stats.map(([name, value]) => (
                      <div key={name}><span>{name}</span><strong>{value}</strong></div>
                    ))}
                  </div>
                  <p>{row.text}</p>
                </div>
              ))}
              <p className={styles.mailNote}>From each company&apos;s latest quarterly report filed with the SEC. Profit margin is profit as a share of sales.</p>
            </div>

            {/* How each stock stacks up against its biggest rivals. */}
            <div className={styles.mailSection}>
              <div className={styles.mailLabel}>How they stack up against rivals</div>
              {SHOWCASE_RIVALS.map((group) => (
                <div className={styles.mailRest} key={group.ticker}>
                  <table className={styles.mailRivals}>
                    <thead><tr><th /><th>Today</th><th>Sales growth</th><th>Margin</th></tr></thead>
                    <tbody>
                      {group.rows.map(([ticker, change, up, growth, margin]) => (
                        <tr key={ticker} className={ticker === group.ticker ? styles.mailSelf : undefined}>
                          <td>{ticker}</td>
                          <td className={up ? styles.mailUp : styles.mailDown}>{change}</td>
                          <td>{growth}</td>
                          <td>{margin}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p>{group.text}</p>
                </div>
              ))}
              <p className={styles.mailNote}>Rivals are the biggest listed companies in the same industry.</p>
            </div>

            <div className={`${styles.mailSection} ${styles.mailIdea}`}>
              <div className={styles.mailLabel}>One idea you can use</div>
              <h3>Capex</h3>
              <p>Capex is short for capital expenditure: money a company spends on big lasting things like data centers, factories, and chips, instead of everyday costs like salaries. When a company raises its capex, it is betting demand will grow. And whoever sells the equipment gets that money as sales.</p>
            </div>

            <div className={styles.mailSection}>
              <div className={styles.mailLabel}>What to watch next</div>
              <ul className={styles.mailWatch}>
                <li><strong>Nvidia earnings.</strong> The number to look for is data center revenue growth. If it keeps climbing, the AI spending story holds up.</li>
                <li><strong>Tesla&apos;s next delivery report.</strong> Look for deliveries beating what analysts expect.</li>
              </ul>
            </div>

            <div className={styles.mailSection}>
              <SampleAsk />
              <RoadmapLinkDemo />
            </div>

            <div className={styles.mailSignoff}>
              <p>That&apos;s the brief. See you tomorrow at 5.</p>
            </div>

            <div className={styles.mailFoot}>
              <span>Manage your watchlist</span>
              <span>Not financial advice. Unsubscribe</span>
            </div>
          </div>
          <figcaption>Example only. Illustrative content, not real market data or advice.</figcaption>
        </figure>

        <div className={styles.ctaWrap}>
          <Link href="/#signup" className={styles.cta}>Build my watchlist <ArrowRight size={16} /></Link>
          <span>Free. Unsubscribe any time.</span>
        </div>
      </main>
      </SpotGlow>
      <SiteFooter />
    </div>
  );
}
