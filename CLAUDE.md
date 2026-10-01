# Metric Finance

Free daily brief, published every trading day at 5 PM ET (after the market closes), that explains a subscriber's chosen US stocks (up to 5) "like you're 5". It is a brief, never call it a newsletter. The brief is posted on the website (`/brief/[id]`, signed link, also listed on the `/manage` dashboard). The daily email is only a notification that links to it. Live at https://metricfinance.app. Owner: Vansh (vanshpandita11@gmail.com).

## Stack
Next.js 16 (App Router, React 19, TypeScript), Tailwind + CSS Modules, Drizzle ORM on Neon Postgres, Amazon SES for email, Anthropic API for the daily explanations, PostHog + Google Analytics for tracking. Hosted on Vercel.

## Commands
- `npm run dev` runs the dev server on port 3000
- `npx tsc --noEmit` and `npm run lint` must both pass before any commit
- `npm run build` for a production build check

## How changes reach the live site
- Vercel is connected to GitHub (`threeoneonetwo/metric-finance-app`). Every push to `main` deploys to production in about a minute. Every pull request gets its own preview URL.
- When working remotely (phone or cloud session): create a branch, push it, open a PR, and share the Vercel preview link. Do NOT push straight to `main` unless the user explicitly says to deploy.
- On the Mac, still show visual changes running locally before pushing.

## Rules from the owner
- Never add Claude as a co-author in commit messages (no `Co-Authored-By` trailer), and don't add "Generated with Claude Code" to PR descriptions.
- Don't use dashes (em dashes or hyphens as punctuation) in marketing copy or SEO titles.
- Don't commit `.env*` files. Secrets live in Vercel env vars.

## Things that are easy to get wrong
- Database changes: `drizzle-kit generate` is broken (stale snapshots). Write SQL migrations by hand in `db/migrations/` and run them against Neon manually (they are NOT applied automatically on deploy).
- "Manage watchlist" links are HMAC-signed and expire after 30 days (`lib/manage-link.ts`, needs `MANAGE_LINK_SECRET`). Never put the raw `unsubscribeToken` in a URL without a signature, and never return it from `/api/subscribe`.
- `/api/subscribe` must return the same response for new and existing emails (no account enumeration).
- Signup sends ONE email (`sendVerificationEmail` in `lib/newsletter/ses.ts`): add us to your contacts, then confirm. Confirming lands on `/manage?welcome=1`. There is no separate welcome email.
- Email confirmation uses a POST from a button page (`/api/verify`) so email security scanners can't trigger it. Keep it that way.
- The daily send runs from a Vercel cron (`vercel.json`, two weekday entries at 21:00 and 22:00 UTC; the route only runs when it is 5 PM in New York, so daylight saving is handled) and calls `/api/cron/send-daily`, which requires `CRON_SECRET`.
- Returning members: opening a valid emailed link sets a signed `mf_session` cookie (90 days, `lib/session.ts`). `proxy.ts` redirects `/` to `/manage` when that cookie is valid; `/manage` and `/brief/[id]` accept either the signed link or the cookie. Sign out is `/api/session/clear`. First access always needs the emailed link, so the add-to-contacts onboarding email still matters.
- Preview deployments share the production database. Don't test signup flows with real addresses on previews.
- Sender address is `briefing@metricfinance.app` (from `SES_FROM_EMAIL`); never hard-code a different one in copy.

## SEO
Homepage title and description target "stocks explained like you're 5" (see `app/page.tsx`). Canonical host is `metricfinance.app` (www redirects to it). Sitemap: `app/sitemap.ts`. AI-crawler summary: `public/llms.txt`. Search Console and Bing Webmaster Tools are used for indexing.

## Known open items
- Amazon SES may still be in sandbox mode (only verified addresses receive email). Needs production access from the AWS account that owns IAM user `metricfinance-ses-sender`.
- Anthropic API credit needs topping up and auto-reload turned on; a failed daily brief emails the owner.
- Testimonials on the homepage are labelled "From real users" and should be confirmed real.
