import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/legal-page";
import styles from "@/components/newsletter-landing.module.css";

export const metadata: Metadata = {
  title: "Terms of Service | Metric Finance",
  description: "The rules for using Metric Finance, including that nothing we publish is financial advice.",
  alternates: { canonical: "https://metricfinance.app/terms" },
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service" updated="September 21, 2026">
      <div className={styles.legalNotice}>
        <p>
          <strong>Metric Finance is not financial advice.</strong> Everything we publish is for general information and
          education only. Investing involves risk, including the loss of money. Make your own decisions, and talk to a
          qualified professional before acting.
        </p>
      </div>

      <p>
        These terms govern your use of metricfinance.app and the Metric Finance daily briefing (together, the
        &quot;Service&quot;), operated by Yashna Pandugala and Vansh Pandita (&quot;we&quot;, &quot;us&quot;). By using the
        Service or subscribing, you agree to these terms. If you do not agree, please do not use it.
      </p>

      <h2>1. Who can use it</h2>
      <p>
        You must be at least 18 years old. The Service is designed for people in the United States and covers
        US-listed stocks.
      </p>

      <h2>2. What the Service is</h2>
      <p>
        Metric Finance is a free email briefing. You choose up to five US-listed stocks, confirm your email, and we send
        a daily summary of how those stocks moved and the news around them, written in plain English. You can also
        manage your watchlist and view past briefings from your account page.
      </p>

      <h2>3. Not financial advice</h2>
      <p>
        We do not provide personalized investment, legal, or tax advice, and nothing in the Service is an offer or a
        recommendation to buy, sell, or hold any security. We do not know your finances or goals. Any decision you make
        is yours alone, and you are responsible for the results.
      </p>

      <h2>4. Accuracy of information</h2>
      <ul>
        <li>Market data may be delayed, incomplete, or wrong. Prices and moves are not real-time quotes.</li>
        <li>
          Briefing text is written with the help of artificial intelligence and based on public data and news headlines.
          It can contain mistakes or miss important context. It may attribute a move to news that did not cause it.
        </li>
        <li>Past performance does not predict future results.</li>
        <li>Always check important facts with the original source or a professional before acting.</li>
      </ul>

      <h2>5. Your subscription</h2>
      <ul>
        <li>
          You must use your own email address, or one you have permission to use. We send a confirmation link first, and
          you will not receive briefings until you click it.
        </li>
        <li>
          Your briefings contain a personal link to your account. Keep it private, because anyone with it can change
          your watchlist or unsubscribe you.
        </li>
        <li>You can unsubscribe at any time from any briefing or from your account page.</li>
      </ul>

      <h2>6. Acceptable use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>sign up an email address that is not yours or that you do not have permission to use;</li>
        <li>use bots, scripts, or other automated means to create subscriptions or send requests in bulk;</li>
        <li>scrape, copy at scale, or resell the Service or its content;</li>
        <li>attempt to break, overload, probe, or gain unauthorized access to the Service or its systems; or</li>
        <li>use the Service for anything unlawful.</li>
      </ul>

      <h2>7. Ownership and content</h2>
      <p>
        The Metric Finance name, site, design, and the written content of our briefings belong to us. You may read them
        and keep copies for your own personal, non-commercial use. Company names, logos, and stock tickers belong to
        their respective owners and appear for identification only. Market data and news come from third parties who
        keep their own rights.
      </p>

      <h2>8. Third-party services and links</h2>
      <p>
        The Service relies on third parties for hosting, email delivery, market data, news, and analytics, and may link to
        outside websites. We do not control them and are not responsible for their content or availability. See our{" "}
        <Link href="/privacy">Privacy Policy</Link> for how your data is handled.
      </p>

      <h2>9. Availability and changes</h2>
      <p>
        We provide the Service free of charge and on a best-effort basis. Briefings may be late, skipped, or contain
        errors, and the site may be unavailable at times. We may change, pause, or end the Service, or block anyone who
        breaks these terms, at any time without notice.
      </p>

      <h2>10. Disclaimer of warranties</h2>
      <p>
        The Service is provided &quot;as is&quot; and &quot;as available&quot;. To the fullest extent the law allows, we
        disclaim all warranties, express or implied, including warranties of accuracy, completeness, timeliness,
        merchantability, fitness for a particular purpose, and non-infringement.
      </p>

      <h2>11. Limitation of liability</h2>
      <p>
        To the fullest extent the law allows, we are not liable for any indirect, incidental, special, consequential, or
        punitive damages, or for any lost profits, investment losses, or trading losses, arising from your use of, or
        reliance on, the Service. Because the Service is free, our total liability for any claim relating to it will not
        exceed $100. Some places do not allow certain limits, so parts of this section may not apply to you.
      </p>

      <h2>12. Changes to these terms</h2>
      <p>
        We may update these terms from time to time. When we do, we will change the date at the top of this page. Your
        continued use of the Service after a change means you accept the updated terms.
      </p>

      <h2>13. General</h2>
      <p>
        These terms, together with our Privacy Policy, are the entire agreement between you and us about the Service. If
        a part of these terms is found unenforceable, the rest stays in effect. These terms are governed by applicable
        United States law.
      </p>

      <h2>14. Contact</h2>
      <p>
        For questions about these terms, reply to any Metric Finance briefing email and put &quot;Terms&quot; in your
        message.
      </p>
    </LegalPage>
  );
}
