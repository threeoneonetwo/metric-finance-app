import { Metadata } from "next";
import Link from "next/link";
import { Mail, ArrowLeft } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import styles from "./confirm-email.module.css";

export const metadata: Metadata = {
  title: "Confirm your email — Metric Finance",
  description: "Check your inbox and click the confirmation link to start receiving your daily briefings.",
};

export default function ConfirmEmailPage() {
  const exampleEmail = "brief@metricfinance.app";

  return (
    <div className={styles.page}>
      <SiteHeader />

      <main className={styles.main}>
        <section className={styles.container}>
          <div className={styles.content}>
            <div className={styles.icon}>
              <Mail size={56} strokeWidth={1.5} />
            </div>

            <h1 className={styles.heading}>Check your inbox</h1>

            <p className={styles.subtitle}>
              We sent a confirmation link to the email address you provided. Click it to verify your email and start receiving your daily briefings.
            </p>

            <div className={styles.steps}>
              <div className={styles.step}>
                <div className={styles.stepNumber}>1</div>
                <div>
                  <h3>Open your email</h3>
                  <p>Look for an email from <code>{exampleEmail}</code></p>
                </div>
              </div>

              <div className={styles.step}>
                <div className={styles.stepNumber}>2</div>
                <div>
                  <h3>Click the confirmation link</h3>
                  <p>The link will verify your email and set up your account</p>
                </div>
              </div>

              <div className={styles.step}>
                <div className={styles.stepNumber}>3</div>
                <div>
                  <h3>Welcome email incoming</h3>
                  <p>You'll receive a welcome email with instructions on whitelisting us</p>
                </div>
              </div>

              <div className={styles.step}>
                <div className={styles.stepNumber}>4</div>
                <div>
                  <h3>Your first briefing</h3>
                  <p>Your personalized daily briefing arrives at 5:00 PM ET tomorrow</p>
                </div>
              </div>
            </div>

            <div className={styles.help}>
              <h4>Didn't receive the email?</h4>
              <ul>
                <li>Check your spam or junk folder</li>
                <li>Make sure you entered the right email address</li>
                <li>
                  Try signing up again — we'll resend the link. Use the same email and stocks.
                </li>
              </ul>
            </div>

            <Link href="/" className={styles.backButton}>
              <ArrowLeft size={18} />
              Back to Metric Finance
            </Link>
          </div>

          <div className={styles.preview}>
            <div className={styles.previewBox}>
              <div className={styles.previewHeader}>
                <div className={styles.previewFrom}>From: {exampleEmail}</div>
                <div className={styles.previewSubject}>Subject: Confirm your Metric Finance briefing</div>
              </div>
              <div className={styles.previewBody}>
                <p style={{ marginTop: 0 }}>
                  <strong>Confirm your Metric Finance briefing</strong>
                </p>
                <p>
                  Click below to confirm your email and start receiving your daily briefing.
                </p>
                <div className={styles.previewButton}>
                  Confirm my email
                </div>
                <p style={{ fontSize: "13px", color: "#8798b4", marginBottom: 0 }}>
                  If you didn't request this, you can ignore this email.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
