'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail } from 'lucide-react';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import styles from './confirm-email.module.css';

export default function ConfirmEmailPage() {
  const [pending, setPending] = useState<{ email: string; tickers: string[] } | null>(null);
  const [resend, setResend] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const leftSectionRef = useRef<HTMLDivElement>(null);
  const rightSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('mf_pending_signup');
      // Reading browser storage is only possible after mount.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (saved) setPending(JSON.parse(saved));
    } catch {
      // Storage unavailable; the page falls back to generic copy.
    }

    // Scroll reveal animations
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(styles.revealed);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -10% 0px' }
    );

    if (leftSectionRef.current) observer.observe(leftSectionRef.current);
    if (rightSectionRef.current) observer.observe(rightSectionRef.current);

    return () => observer.disconnect();
  }, []);

  async function resendLink() {
    if (!pending) return;
    setResend('sending');
    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(pending),
      });
      setResend(response.ok ? 'sent' : 'error');
    } catch {
      setResend('error');
    }
  }

  return (
    <div className={styles.page}>
      <SiteHeader />

      <main className={styles.main}>
        <div className={styles.container}>
          {/* Left Section */}
          <div ref={leftSectionRef} className={`${styles.leftSection} ${styles.fadeInLeft}`}>
            <div className={styles.badge}>CHECK YOUR EMAIL</div>

            <h1 className={styles.heading}>Check your inbox</h1>

            <div className={styles.emailBlock}>
              <p className={styles.emailLabel}>We sent two quick steps to</p>
              <div className={styles.emailRow}>
                <span className={styles.emailAddress}>{pending?.email ?? 'your email address'}</span>
                <Link href="/" className={styles.changeLink}>
                  Change
                </Link>
              </div>
            </div>

            <div className={styles.actionButtons}>
              <a
                href="https://mail.google.com/mail/u/0/#inbox"
                className={`${styles.btn} ${styles.btnPrimary}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Open Gmail
              </a>
              <a
                href="https://outlook.live.com/mail/0/inbox"
                className={`${styles.btn} ${styles.btnSecondary}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Open Outlook
              </a>
            </div>

            <div className={styles.noEmailBlock}>
              <span>No email yet?</span>
              {pending ? (
                <button
                  type="button"
                  onClick={resendLink}
                  disabled={resend === 'sending' || resend === 'sent'}
                  className={styles.resendLink}
                  style={{ background: 'none', border: 0, padding: 0, font: 'inherit' }}
                >
                  {resend === 'sending' ? 'Sending…' : resend === 'sent' ? 'Sent again. Check your inbox' : resend === 'error' ? 'Try again in a few minutes' : 'Resend the link'}
                </button>
              ) : (
                <Link href="/#signup" className={styles.resendLink}>
                  Sign up again
                </Link>
              )}
            </div>

            <Link href="/" className={styles.backLink}>
              <ArrowLeft size={16} />
              Back to Metric Finance
            </Link>
          </div>

          {/* Right Section */}
          <div ref={rightSectionRef} className={`${styles.rightSection} ${styles.fadeInRight}`}>
            <h3 className={styles.previewLabel}>WHAT YOU&apos;LL FIND INSIDE</h3>

            <div className={styles.emailPreview}>
              <div className={styles.previewHeader}>
                <div className={styles.previewFrom}>
                  <Mail size={16} />
                  <div>
                    <div className={styles.previewSender}>Metric Finance</div>
                    <div className={styles.previewEmail}>briefing@metricfinance.app</div>
                  </div>
                </div>
                <div className={styles.previewTime}>Just now</div>
              </div>

              <div className={styles.previewBody}>
                <h4 className={styles.previewTitle}>Two quick steps and you&apos;re in</h4>

                <div className={styles.previewStep}>
                  <span className={styles.previewStepNum}>1</span>
                  <div>
                    <strong>Add us to your contacts</strong>
                    <p>Save briefing@metricfinance.app so your briefs reach your main inbox, not spam.</p>
                    <ul className={styles.previewTips}>
                      <li>Gmail: drag the email to the Primary tab</li>
                      <li>Outlook: right click our name, then Add to Safe Senders</li>
                      <li>Apple Mail: tap our name, then Add to VIPs</li>
                    </ul>
                  </div>
                </div>

                <div className={styles.previewStep}>
                  <span className={styles.previewStepNum}>2</span>
                  <div>
                    <strong>Confirm your email</strong>
                    <p>One tap tells us you&apos;re a real person. You&apos;ll land on your dashboard with your first brief on its way.</p>
                  </div>
                </div>

                <span className={styles.previewButton} aria-hidden="true">Confirm my email</span>
              </div>
            </div>

          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
