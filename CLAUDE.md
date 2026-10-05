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
- Never use dashes (em dashes, en dashes or hyphens as punctuation) in any content: marketing copy, SEO titles, Learn pages, guides, glossary. Hyphens in compound words are avoided too (write "self driving", not "self-driving").
- Don't commit `.env*` files. Secrets live in Vercel env vars.

## Things that are easy to get wrong
- Database changes: `drizzle-kit generate` is broken (stale snapshots). Write SQL migrations by hand in `db/migrations/` and run them against Neon manually (they are NOT applied automatically on deploy).
- "Manage watchlist" links are HMAC-signed and expire after 30 days (`lib/manage-link.ts`, needs `MANAGE_LINK_SECRET`). Never put the raw `unsubscribeToken` in a URL without a signature, and never return it from `/api/subscribe`.
- One signup per email. `/api/subscribe` answers 409 `already_subscribed` for a confirmed address (the owner chose this over hiding it, so it does reveal that an address is subscribed; keep the per email and per IP rate limits) and also emails that person their dashboard link. Unconfirmed addresses just get a fresh confirmation email.
- Signup sends ONE email (`sendVerificationEmail` in `lib/newsletter/ses.ts`): add us to your contacts, then confirm. Confirming lands on `/manage?welcome=1`. There is no separate welcome email.
- Email confirmation uses a POST from a button page (`/api/verify`) so email security scanners can't trigger it. Keep it that way.
- The daily send runs from a Vercel cron (`vercel.json`, two weekday entries at 21:00 and 22:00 UTC; the route only runs when it is 5 PM in New York, so daylight saving is handled) and calls `/api/cron/send-daily`, which requires `CRON_SECRET`.
- Returning members: opening a valid emailed link sets a signed `mf_session` cookie (90 days, `lib/session.ts`). `proxy.ts` redirects `/` to `/manage` when that cookie is valid; `/manage` and `/brief/[id]` accept either the signed link or the cookie. Sign out is `/api/session/clear`. First access always needs the emailed link, so the add-to-contacts onboarding email still matters.
- Analytics: server events go to PostHog through `lib/analytics-server.ts` (signup_submitted, email_confirmed, brief_opened, dashboard_viewed, brief_sent, daily_send_run and others), identified by a random subscriber id, never an email. Own accounts and test addresses carry `internal: true`. The dashboard is "Metric Finance: Product Metrics" in PostHog project 487674 (shared with Roast My Startup, so filter web events by `$host`).
- Email health: every email is sent through the SES configuration set `metric-finance-email-events`, which publishes deliveries, hard bounces, complaints and rejects to the SNS topic of the same name. SNS posts them to `/api/ses-events` (signature checked, topic ARN pinned to AWS account 809668424139), which forwards them to PostHog and deactivates hard bounced or complaining addresses. If the configuration set is ever deleted, `sendEmail` falls back to a normal send.
- Preview deployments share the production database. Don't test signup flows with real addresses on previews.
- All email is sent as "Vansh Pandita <vp@metricfinance.app>" (`lib/sender.ts`, one constant, no env var). Use `SENDER_EMAIL` in copy instead of typing the address. The old `SES_FROM_EMAIL` env var is no longer read. Mail sent to vp@ has nowhere to land until inbound routing exists; replies use Reply-To.

## Learn section (programmatic SEO)
- Header and footer link to `/learn`, the blog. All programmatic SEO lives there: `/learn/stocks/[symbol]` (a guide for every Nasdaq and NYSE stock; the browse list lives on the `/learn` hub, and `/learn/stocks` 301 redirects to `/learn#stocks`), `/learn/terms/[slug]` (glossary), `/learn/guides/[slug]` (long explainers), `/learn/compare/[a]-vs-[b]` (comparisons).
- Content sources: `lib/learn/terms.ts`, `lib/learn/guides.ts`, `lib/stock-guides.ts` (hand written, 22 stocks), `lib/learn/stocks.ts` (templates by sector for every other stock). Add new terms and guides to those files; the sitemap picks them up.
- Stock pages make NO live market data calls. Facts come from `data/us-stocks.json` (all ~7,000 stocks, built from the free SEC list by `scripts/build-us-stocks.mjs`) and `data/stock-profiles.json` (sector, industry, market cap; refresh with `scripts/build-stock-profiles.mjs`). Only stocks with a profile or a hand written guide are indexable; the rest are served with noindex.
- The Learn section updates itself every trading day. After the 5 PM send, `/api/cron/send-daily` runs `refreshLearn()` (`lib/learn/refresh.ts`, in `after()`): it publishes the day's market recap (`/learn/market-today/[date]`), one new guide from the topic queue in `lib/learn/topics.ts` (add topics there), and rewrites about 12 stock pages with Claude using the provider's company profile (the stalest pages first). Content lives in the Neon tables `learn_articles` and `learn_stock_pages` (migration `0007_learn_content.sql`, already applied). Pages fall back to the built in content when a table row is missing. Every string is scrubbed of dashes in `lib/learn/claude.ts`. New URLs are sent to IndexNow (Bing and others); the sitemap rebuilds hourly. Manual run: `GET /api/cron/learn-refresh?only=recap,guide,stocks&limit=12` with `Authorization: Bearer $CRON_SECRET`. Set `LEARN_MODEL` to change the writing model (defaults to `CLAUDE_MODEL`).
- Signup accepts any stock in `data/us-stocks.json`. The picker searches it through `/api/stocks/search`.
- The FMP market data plan has a small daily call limit (the free tier is about 250). The daily brief uses about 3 calls per unique ticker, so many subscribers following many different stocks will hit it. Upgrade the FMP plan before growing.

## SEO
Homepage title and description target "stocks explained like you're 5" (see `app/page.tsx`). Canonical host is `metricfinance.app` (www redirects to it). Sitemap: `app/sitemap.ts`. AI-crawler summary: `public/llms.txt`. Search Console and Bing Webmaster Tools are used for indexing.

## Known open items
- Anthropic API credit needs topping up and auto-reload turned on; a failed daily brief emails the owner.
- Testimonials on the homepage are labelled "From real users" and should be confirmed real.
