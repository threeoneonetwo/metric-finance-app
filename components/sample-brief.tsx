import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";
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

export function SampleBrief() {
  return (
    <div className={styles.page}>
      <SiteHeader />
      <main className={styles.main}>
        <div className={styles.intro}>
          <span className={styles.kicker}>Sample brief</span>
          <h1>Your next favourite daily brief</h1>
          <p>One bite sized brief, posted on the site every trading day at 5 PM ET, explaining everything about your stocks, what moved, and why, in words anyone can follow. We email you when it is up.</p>
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

            <div className={styles.mailSignoff}>
              <p>That&apos;s the brief. See you tomorrow at 5.</p>
              <div className={styles.mailShare}>
                <span>Know someone who nods along when people say &quot;capex&quot;? Send them today&apos;s idea, no watchlist attached.</span>
                <em>Share today&apos;s idea</em>
              </div>
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
      <SiteFooter />
    </div>
  );
}
