import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = {
  title: "Privacy Policy | Metric Finance",
  description: "What Metric Finance collects, why, who we share it with, and the choices you have.",
  alternates: { canonical: "https://metricfinance.app/privacy" },
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="September 21, 2026">
      <p>
        Metric Finance (&quot;we&quot;, &quot;us&quot;) is a free daily stock briefing at metricfinance.app, built by Yashna
        Pandugala and Vansh Pandita. This policy explains what we collect when you use the site or subscribe to the
        briefing, how we use it, and the choices you have. We wrote it to be read, so it is short and specific.
      </p>

      <h2>1. What we collect</h2>
      <h3>What you give us</h3>
      <ul>
        <li><strong>Email address</strong> so we can send your confirmation link and your daily briefing.</li>
        <li><strong>Your watchlist</strong>: the stock tickers (up to five) you choose to follow.</li>
        <li><strong>Your name</strong>, only if you choose to provide it.</li>
      </ul>

      <h3>What we generate</h3>
      <ul>
        <li>Private confirmation and account-link tokens tied to your subscription.</li>
        <li>When you signed up, when you confirmed your email, and when we last sent you a briefing.</li>
        <li>A copy of each briefing we send you, so you can look back at it in your account.</li>
      </ul>

      <h3>What we collect automatically</h3>
      <ul>
        <li>
          <strong>Usage data</strong> such as pages viewed, stock searches, and button clicks, collected through
          analytics tools (see section 4).
        </li>
        <li>
          <strong>Approximate location</strong> (country, region, city, time zone) derived from your IP address. We
          store a one-way hash of your IP address rather than the address itself.
        </li>
        <li>
          <strong>Device and browser information</strong> such as browser type, screen size, and referring page.
        </li>
      </ul>

      <h3>Browser storage</h3>
      <p>
        After you subscribe, we save a private token in your browser&apos;s local storage. It lets us take you straight to
        your account page when you come back. Our analytics providers may also set cookies or similar identifiers.
      </p>

      <h2>2. How we use it</h2>
      <ul>
        <li>To send your confirmation email and your daily briefing on the stocks you chose.</li>
        <li>To let you view and change your watchlist and see past briefings.</li>
        <li>To understand how the site is used and to improve it.</li>
        <li>To prevent abuse, fraud, and spam signups, and to keep the service secure.</li>
        <li>To comply with the law when required.</li>
      </ul>
      <p>We do not sell your personal information, and we do not share it with third parties for advertising.</p>

      <h2>3. Who processes your data</h2>
      <p>We use these service providers to run Metric Finance. They handle data only to provide their service to us.</p>
      <ul>
        <li><strong>Vercel</strong> hosts the website and provides basic traffic analytics.</li>
        <li><strong>Neon</strong> hosts the database that stores subscriber records and briefing history.</li>
        <li><strong>Amazon Web Services (SES)</strong> delivers our emails.</li>
        <li>
          <strong>Financial Modeling Prep</strong> and public news headlines supply market data and news. We send them
          stock tickers, not personal information.
        </li>
        <li>
          <strong>Anthropic</strong> provides the AI model that helps write the plain-English briefing text. We send it
          ticker symbols, prices, and public headlines. We do not send your email address, name, or any other
          personal information.
        </li>
      </ul>

      <h2>4. Analytics</h2>
      <p>To understand what works on the site, we use:</p>
      <ul>
        <li><strong>Google Analytics</strong> for page views and traffic sources.</li>
        <li><strong>Vercel Analytics</strong> for page views and performance.</li>
        <li>
          <strong>Microsoft Clarity</strong>, which may record how visitors click, scroll, and move through pages
          (heatmaps and session replays).
        </li>
        <li><strong>PostHog</strong> for product events such as stock searches.</li>
      </ul>
      <p>
        These providers may use cookies or similar technologies and have their own privacy policies. You can block
        analytics cookies in your browser settings or with a content blocker.
      </p>

      <h2>5. Your choices</h2>
      <ul>
        <li>
          <strong>Change your watchlist</strong> anytime from your account page, linked from every briefing and from
          the footer of this site.
        </li>
        <li>
          <strong>Unsubscribe</strong> anytime using the link at the bottom of every briefing, or from your account
          page. This stops all emails.
        </li>
        <li>
          <strong>Ask us to delete your data.</strong> Unsubscribing stops emails but does not by itself erase your
          record. We keep your email, watchlist, and briefing history until you ask us to delete them (see section
          9).
        </li>
        <li>
          <strong>Access or correct your data.</strong> You can see your watchlist and past briefings in your account.
          For anything else, contact us.
        </li>
      </ul>
      <p>
        Depending on where you live, including California, you may have additional rights to know, access, correct,
        or delete personal information. We honor those requests. We do not sell or share personal information for
        cross-context advertising.
      </p>

      <h2>6. Keeping your account link private</h2>
      <p>
        Your briefings contain a personal link to your account page. Anyone who has that link can view your watchlist,
        change it, or unsubscribe you. Please do not forward your briefings publicly.
      </p>

      <h2>7. Security and retention</h2>
      <p>
        We use reasonable technical and organizational measures to protect your information, including encrypted
        connections and access controls on our systems. No method of transmission or storage is completely secure, so
        we cannot guarantee absolute security. We keep your subscriber record and briefing history until you ask us to
        delete them, and we keep analytics data for as long as our analytics providers retain it.
      </p>

      <h2>8. Children</h2>
      <p>
        Metric Finance is intended for adults and is not directed to anyone under 18. We do not knowingly collect
        information from children. If you believe a child has subscribed, contact us and we will delete the record.
      </p>

      <h2>9. Contact</h2>
      <p>
        For privacy questions or to make a request, reply to any Metric Finance briefing email and put
        &quot;Privacy&quot; in your message.
      </p>

      <h2>10. Changes to this policy</h2>
      <p>
        We may update this policy from time to time. When we do, we will change the date at the top of this page. If a
        change is significant, we will also tell subscribers by email. Our{" "}
        <Link href="/terms">Terms of Service</Link> also apply to your use of Metric Finance.
      </p>
    </LegalPage>
  );
}
