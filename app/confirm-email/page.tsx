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
  const stepItemsRef = useRef<HTMLDivElement[]>([]);

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
    stepItemsRef.current.forEach((el) => {
      if (el) observer.observe(el);
    });

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
            <div className={styles.badge}>ONE STEP LEFT</div>

            <h1 className={styles.heading}>Check your inbox</h1>

            <div className={styles.emailBlock}>
              <p className={styles.emailLabel}>We sent a confirmation link to</p>
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

            <div className={styles.stepsSection}>
              <h3 className={styles.stepsTitle}>WHAT HAPPENS NEXT</h3>
              <div className={styles.stepsList}>
                {[
                  { num: '1', title: 'Open your email', desc: 'Look for an email from briefing@metricfinance.app', tag: 'YOU ARE HERE' },
                  { num: '2', title: 'Click the confirmation link', desc: 'The link will verify your email and set up your account', tag: undefined },
                  { num: '3', title: 'Welcome email incoming', desc: 'You\'ll receive a welcome email with instructions on whitelisting us', tag: undefined },
                  { num: '4', title: 'Your first briefing', desc: 'Your first briefing arrives right after you confirm, then every weekday morning', tag: undefined },
                ].map((step, idx) => (
                  <div
                    key={idx}
                    ref={(el) => {
                      if (el) stepItemsRef.current[idx] = el;
                    }}
                    className={`${styles.stepItem} ${styles.slideInUp}`}
                    style={{ transitionDelay: `${idx * 100}ms` }}
                  >
                    <div className={styles.stepNumber}>{step.num}</div>
                    <div className={styles.stepContent}>
                      <div className={styles.stepTitle}>
                        {step.title}
                        {step.tag && <span className={styles.stepTag}>{step.tag}</span>}
                      </div>
                      <p className={styles.stepDesc}>{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Link href="/" className={styles.backLink}>
              <ArrowLeft size={16} />
              Back to Metric Finance
            </Link>
          </div>

          {/* Right Section */}
          <div ref={rightSectionRef} className={`${styles.rightSection} ${styles.fadeInRight}`}>
            <h3 className={styles.previewLabel}>LOOK FOR THIS EMAIL</h3>

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
                <h4 className={styles.previewTitle}>Confirm your Metric Finance briefing</h4>
                <p className={styles.previewText}>Click below to confirm your email and start receiving your daily briefing.</p>
                <button className={styles.previewButton}>Confirm my email</button>
                <p className={styles.previewFooter}>If you didn&apos;t request this, you can ignore this email.</p>
              </div>
            </div>

            <div className={`${styles.troubleshoot} ${styles.slideInUp}`}>
              <h4 className={styles.troubleshootTitle}>Didn&apos;t receive the email?</h4>
              <div className={styles.troubleshootList}>
                {[
                  'Check your spam or junk folder',
                  'Make sure you entered the right email address',
                  'Try signing up again — we\'ll resend the link. Use the same email and stocks.',
                ].map((item, idx) => (
                  <div key={idx} className={styles.troubleshootItem}>
                    <span className={styles.troubleshootNum}>0{idx + 1}</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
