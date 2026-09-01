# Metric Finance Product & Tech Brief

Last updated: 2026-07-02

## 1. Product Summary

Metric Finance is an AI-powered equity research product for public companies. The MVP lets a user search any NSE or BSE listed company and receive a shareable stock analysis brief covering the company summary, price action, peer comparison, fundamentals, news sentiment, technical signals, and key risks.

The product direction is simple: make first-pass stock research faster, clearer, and easier to revisit. A user should be able to move from "I am curious about this stock" to "I understand the basic case, risks, current market read, and next checks" in seconds.

The current experience is centered around two flows:

- Search and analysis: users enter a company name or ticker from the homepage or report header.
- Report reading: users receive a structured analysis page at `/r/[ticker]`, with cached AI output and live market data where available.

## 2. What We Built

### Core Stock Analysis Experience

We built the main stock analysis journey around fast ticker resolution, report generation, and shareable report pages.

- Homepage search for NSE and BSE listed stocks.
- Ticker and company-name resolution across NSE/BSE-style symbols.
- AI-generated equity research report payloads.
- Report pages with price, day change, range position, volume read, peer lens, risk cards, news context, and technical signals.
- Shareable report URLs under `/r/[ticker]`.
- Refresh path for forcing a new analysis when needed.
- A mock/fallback report path so the app still works when an AI key or live dependency is unavailable.

### AI Research Layer

The report generation layer uses Claude through the AI SDK. Generated reports are cached so repeat views are fast and cheaper than regenerating every time.

The AI layer produces:

- Executive-style summary.
- "Before You Buy" brief.
- Metric-level interpretation.
- Valuation, earnings, and market-timing risk language.
- Plain-English explanations of what the current data means.

The implementation keeps the generated report payload structured instead of treating the output as one large block of text. This makes the UI more reliable and lets the product show different pieces of the analysis in purpose-built sections.

### Market Data Integrations

We added a market-data abstraction with multiple provider implementations. The MVP currently supports Yahoo Finance as a temporary bridge and has adapters for OpenAlgo and Upstox-style data.

The report experience can use market data for:

- Current price.
- Day change.
- Open, high, low, close.
- Volume.
- 52-week range.
- Sector and industry.
- Market-data timestamp.

This provider abstraction keeps the product from being locked to one temporary data source and gives us a path to move toward a more reliable production data vendor.

### Report Cache and Persistence

We added Postgres persistence with Drizzle ORM for generated reports and generation jobs.

The report cache is important for three reasons:

- Speed: cached report reads are much faster than fresh AI generation.
- Cost: repeat views avoid unnecessary Claude calls.
- Product quality: saved reports make shareable links stable and reduce dependency failures during normal browsing.

The database stores generated report payloads, source data, timestamps, status, and generation-job metadata.

### Product Analytics

We added analytics instrumentation through PostHog and local product-event logging.

Tracked events include:

- Landing views.
- Search opens and submits.
- Report views.
- Shares.
- Analysis runs.

We also added owner-traffic exclusion so internal testing can be filtered out of analytics by setting `localStorage.metric_owner = "1"`.

The analytics model supports funnel analysis and understanding which tickers or flows users actually use.

### UI and UX Pass

We refined the app interface around a dark finance-dashboard style.

The UI work included:

- Shared site header and footer.
- Cleaner homepage structure.
- Compact search-focused landing experience.
- Testimonials and FAQ sections.
- Report page layout refinements.
- Mobile-safe spacing and responsive dashboard sections.
- Reusable brief card deck formatting.
- More consistent glass-panel and dark-tile styling.

The design goal was to keep the experience practical and finance-focused rather than making it feel like a generic marketing page.

## 3. Technical Architecture

### Frontend

- Framework: Next.js 15 App Router.
- UI: React 19 and Tailwind CSS 4.
- Icons: Lucide React.
- Deployment target: Vercel-compatible Next.js app.

Important routes:

- `/`: homepage and ticker search.
- `/r/[ticker]`: shareable report page.
- `/analyze/[ticker]`: report generation or refresh flow.
- `/api/reports/[ticker]`: report JSON.
- `/api/resolve`: ticker resolution.
- `/api/product-events`: event capture.

### Backend and Data

- Database: Postgres.
- ORM: Drizzle.
- Main tables:
  - `reports`
  - `generation_jobs`
  - `product_events`
  - `config`

The database layer is defensive: when a database connection is missing in local or fallback environments, the app avoids hard crashes where possible and falls back to empty states or mock data.

### AI and Data Services

- Claude report generation via `@ai-sdk/anthropic` and `ai`.
- Market data provider layer under `services/marketData`.
- Optional fundamentals providers under `services/fundamentals`.
- Tradient integration for news and technical signals.
- Google News RSS fallback where useful.

The service structure separates product routes from provider-specific code, which keeps the app easier to change as data providers evolve.

### Analytics

- Client analytics: PostHog browser SDK.
- Server analytics: PostHog server capture helper.
- Durable event store: `product_events` table.

This dual approach gives us both external analytics dashboards and first-party event history in Postgres.

## 4. Process We Followed

### Phase 1: MVP Research Flow

We started with the core job-to-be-done: a user wants a quick, readable stock analysis. The first priority was making search, report generation, and report presentation work end to end.

The early product surface focused on:

- Accepting ticker/company input.
- Generating useful AI-backed report content.
- Displaying the report in a structured page.
- Making reports shareable.

### Phase 2: Data Grounding and Caching

Once the report experience worked, we added stronger data grounding and persistence.

This included:

- Market-data snapshots.
- Source data stored alongside reports.
- 24-hour report reuse.
- Generation-job tracking.
- Fallback behavior when providers or keys are missing.

This moved the app from a demo-style generation flow toward a more production-ready research product.

### Phase 3: Product Analytics

After the core flow was usable, we instrumented the product. The goal was to make user behavior measurable before investing further in features.

We tracked:

- Acquisition and landing views.
- Search intent.
- Report engagement.
- Share behavior.
- Analysis generation.
- Signup and signin lifecycle.
- Active-user signals.

This gives us the measurement foundation for funnels, activation, retention, and cost-per-use analysis.

### Phase 4: UX Polish

Finally, we tightened the product presentation:

- Cleaner dark visual system.
- Shared navigation.
- Better homepage structure.
- Report page refinements for scanning.
- Mobile-safe spacing and responsive layouts.

The focus was to make the app feel like a credible finance tool while keeping the first action obvious: search a stock.

## 5. Current State

Metric Finance is now a working MVP with:

- Free stock search and AI reports.
- Cached report generation.
- Shareable report pages.
- Market data grounding.
- Product analytics.
- Deployment-ready Next.js architecture.

The product is ready for continued user testing, analytics review, and iteration on data quality.

## 6. Key Tradeoffs and Decisions

- We kept analysis free without requiring login, because forcing auth before value would reduce discovery.
- We cached AI reports to control latency and cost.
- We used a provider abstraction for market data so the MVP can start with accessible data and later move to a licensed production provider.
- We tracked events in both PostHog and Postgres so we can use dashboards while still owning the raw product-event history.
- We treated Yahoo Finance as a short-term MVP data bridge, not the final production data source.

## 7. Recommended Next Steps

### Product

- Review analytics funnels: landing view to search, search to report, and report to share.
- Add a "recently viewed" view.
- Add clearer report freshness labels.

### Technical

- Add tests around ticker resolution and report cache behavior.
- Persist AI token usage per generation job for exact cost tracking.
- Choose and integrate a production-grade market data provider for NSE and BSE listings.
- Add stricter schema validation around AI-generated payloads.
- Review production env vars and deployment settings before public launch.

## 8. Environment and Operations

Important environment variables include:

- `DATABASE_URL`
- `ANTHROPIC_API_KEY`
- `CLAUDE_MODEL`
- `MARKET_DATA_PROVIDER`
- `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN`
- `NEXT_PUBLIC_POSTHOG_HOST`
- `POSTHOG_PERSONAL_API_KEY` or server-side PostHog configuration where applicable

Main commands:

```bash
npm install
npm run dev
npm run lint
npm run build
npm run db:generate
npm run db:migrate
```
