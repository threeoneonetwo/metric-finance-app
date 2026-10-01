'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Check } from 'lucide-react';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import styles from './confirm-email.module.css';

const FROM_ADDRESS = 'briefing@metricfinance.app';

const STEPS = [
  { key: 'inbox', title: 'Open your inbox', body: 'Go to the inbox for the email address below. That is where we sent your setup email.', next: 'Next →' },
  { key: 'find', title: 'Find our email', body: `Look for a new message from Metric Finance sent by ${FROM_ADDRESS}. It should be at the top of your inbox.`, next: 'Found it →' },
  { key: 'contacts', title: 'Add us to your contacts', body: `Save ${FROM_ADDRESS} as a contact so your daily briefs always land in your main inbox instead of your spam folder.`, next: 'Done →' },
  { key: 'confirm', title: 'Confirm your email', body: 'Press the confirm button in the email to activate your subscription. You will then land on your dashboard, and your first brief will be on its way.', next: '' },
] as const;

const TIPS = [
  { label: 'Gmail', tip: 'Drag the email to the Primary tab.' },
  { label: 'Outlook', tip: 'Right click our name, then Add to Safe Senders.' },
  { label: 'Apple Mail', tip: 'Tap our name, then Add to VIPs.' },
] as const;

const COOLDOWN_SECONDS = 30;

export default function ConfirmEmailPage() {
  const [pending, setPending] = useState<{ email: string; tickers: string[] } | null>(null);
  const [active, setActive] = useState(0);
  const [tab, setTab] = useState(0);
  const [cooldown, setCooldown] = useState(0);
  const [resend, setResend] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('mf_pending_signup');
      // Reading browser storage is only possible after mount.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (saved) setPending(JSON.parse(saved));
    } catch {
      // Storage unavailable; the page falls back to generic copy.
    }
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((seconds) => seconds - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  async function resendLink() {
    if (!pending || cooldown > 0 || resend === 'sending') return;
    setResend('sending');
    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(pending),
      });
      setResend(response.ok ? 'sent' : 'error');
      if (response.ok) setCooldown(COOLDOWN_SECONDS);
    } catch {
      setResend('error');
    }
  }

  const resendLabel =
    resend === 'sending' ? 'Sending…'
    : cooldown > 0 ? `Sent. Resend in ${cooldown}s`
    : resend === 'error' ? 'Try again in a few minutes'
    : 'Resend the link';

  return (
    <div className={styles.page}>
      <SiteHeader />

      <main className={styles.main}>
        <div className={styles.container}>
          <div className={styles.progress}>
            <div className={styles.bars}>
              {STEPS.map((step, index) => (
                <span
                  key={step.key}
                  className={`${styles.bar} ${index < active ? styles.barDone : index === active ? styles.barNow : ''}`}
                />
              ))}
            </div>
            <span className={styles.progressLabel}>STEP {Math.min(active + 1, STEPS.length)} OF {STEPS.length}</span>
          </div>

          <h1 className={styles.heading}>Check your inbox</h1>
          <p className={styles.lead}>We just sent you an email that sets up your daily brief. Follow the four steps below to finish signing up.</p>

          <ol className={styles.steps}>
            {STEPS.map((step, index) => {
              const done = index < active;
              const current = index === active;
              return (
                <li key={step.key} className={styles.step} style={{ animationDelay: `${index * 80}ms` }}>
                  <div className={styles.rail}>
                    <span className={`${styles.dot} ${done ? styles.dotDone : current ? styles.dotNow : ''}`}>
                      {done ? <Check size={18} strokeWidth={3} /> : index + 1}
                    </span>
                    {index < STEPS.length - 1 && <span className={`${styles.line} ${done ? styles.lineDone : ''}`} />}
                  </div>

                  <div className={`${styles.stepBody} ${index > active ? styles.stepDim : ''}`}>
                    <div className={styles.stepNum}>STEP {String(index + 1).padStart(2, '0')}</div>
                    <h2 className={styles.stepTitle}>{step.title}</h2>
                    <p className={styles.stepText}>{step.body}</p>

                    {step.key === 'inbox' && (
                      <div className={styles.emailBox}>
                        <span className={styles.emailAddress}>{pending?.email ?? 'your email address'}</span>
                        <Link href="/#signup" className={styles.change}>Change</Link>
                      </div>
                    )}

                    {step.key === 'find' && (
                      <>
                        <div className={styles.card}>
                          <div className={styles.cardHead}>
                            <span className={styles.mf}>MF</span>
                            <div className={styles.cardFrom}>
                              <strong>Metric Finance</strong>
                              <span>Confirm your email to start your Metric Finance briefs</span>
                            </div>
                            <span className={styles.cardTime}>Just now</span>
                          </div>
                          <div className={styles.cardBody}>
                            <div className={styles.cardLabel}>INSIDE THE EMAIL</div>
                            <ul className={styles.cardList}>
                              <li>Two quick steps to set you up</li>
                              <li>A button to confirm your email</li>
                              <li>Your first brief, on its way as soon as you confirm</li>
                            </ul>
                          </div>
                        </div>
                        <p className={styles.hint}>If you cannot find it, check your Spam or Promotions folder.</p>
                      </>
                    )}

                    {step.key === 'contacts' && (
                      <div className={styles.card}>
                        <div className={styles.tabs} role="tablist">
                          {TIPS.map((item, tipIndex) => (
                            <button
                              key={item.label}
                              type="button"
                              role="tab"
                              aria-selected={tab === tipIndex}
                              className={`${styles.tab} ${tab === tipIndex ? styles.tabOn : ''}`}
                              onClick={() => setTab(tipIndex)}
                            >
                              {item.label}
                            </button>
                          ))}
                        </div>
                        <div className={styles.tip}>{TIPS[tab].tip}</div>
                      </div>
                    )}

                    {step.key === 'confirm' && (
                      <div className={styles.pressHint}>
                        In the email, press <span>Confirm my email</span>
                      </div>
                    )}

                    {current && step.next && (
                      <button type="button" className={styles.next} onClick={() => setActive(index + 1)}>
                        {step.next}
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>

          <section className={styles.ready}>
            <div>
              <div className={styles.readyLabel}>READY?</div>
              <div className={styles.readyTitle}>Open your inbox and confirm</div>
            </div>
            <div className={styles.openRow}>
              <a href="https://mail.google.com/" target="_blank" rel="noopener noreferrer" className={styles.openPrimary}>Open Gmail</a>
              <a href="https://outlook.live.com/" target="_blank" rel="noopener noreferrer" className={styles.openGhost}>Open Outlook</a>
              <a href="https://www.icloud.com/mail" target="_blank" rel="noopener noreferrer" className={styles.openGhost}>Open iCloud Mail</a>
            </div>
            <div className={styles.readyFoot}>
              <span className={styles.noEmail}>
                No email yet?{' '}
                {pending ? (
                  <button type="button" className={styles.resend} onClick={resendLink} disabled={cooldown > 0 || resend === 'sending'}>
                    {resendLabel}
                  </button>
                ) : (
                  <Link href="/#signup" className={styles.resend}>Sign up again</Link>
                )}
              </span>
              <Link href="/" className={styles.back}><ArrowLeft size={16} /> Back to Metric Finance</Link>
            </div>
          </section>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
