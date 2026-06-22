# Metric Finance Software Usage And Cost Notes

Last updated: 2026-06-14

This document summarizes the software and APIs used by the Metric Finance MVP, what each one does, and how the cost is expected to behave. It is based on the current repository, local environment variable names, and public pricing pages. Exact invoices still need to be checked in each provider dashboard.

## Current Snapshot

The production app is a Next.js application deployed through Vercel, backed by a Neon Postgres database. It generates stock analysis reports using Claude, stores generated reports for reuse, and enriches pages with market data, technical signals, news, and analytics.

Current observed usage from the database:

| Metric | Value |
| --- | ---: |
| Logged analysis requests | 953 |
| Fresh uncached analysis jobs | 552 |
| Cache hits | 401 |
| Error jobs | 13 |
| First logged job | 2026-05-26 |
| Last checked | 2026-06-14 |
| Database size | ~9.6 MB |

AI token usage is not currently stored, so token and spend numbers are estimates. Based on stored report sizes and the current three-call Claude generation flow, a fresh uncached analysis is estimated at roughly 7,000 to 9,000 total tokens.

Estimated AI usage to date:

| Estimate | Tokens |
| --- | ---: |
| Input tokens | ~2.5M to 3.3M |
| Output tokens | ~1.4M to 1.8M |
| Total tokens | ~3.9M to 5.0M |

## Cost Summary

| Software | Used For | Current Cost Model | Estimated Cost |
| --- | --- | --- | ---: |
| Vercel | Hosting, serverless app runtime, deployments, Vercel Analytics | Free Hobby or Pro from $20/user/month, plus usage | Needs dashboard check |
| Neon | Postgres database for reports, jobs, dashboard events | Free tier or usage-based paid plans | Likely $0 at current DB size unless on paid plan |
| Anthropic Claude | Main AI report generation | Per token | ~$0.04 to $0.06 per fresh analysis |
| Yahoo Finance endpoints | Temporary MVP market data bridge | No API key in app | $0 direct software cost |
| Upstox APIs | Broker-backed quotes and fundamentals when configured | Public API access listed as free; order brokerage can apply | $0 for read-only API usage, trading orders not used here |
| Tradient | Market news and technical indicators | Public pricing says free API access | $0 direct software cost |
| Google News RSS | Backup news source | Public RSS endpoint | $0 direct software cost |
| Google Analytics | Visitor and page analytics | Standard GA is free | $0 direct software cost |
| Vercel Analytics | In-app analytics package | Included or usage-based by Vercel plan | Needs dashboard check |
| Gemini API | Legacy or fallback AI reports in older data | Per token if used | Not currently active for main generation |
| Financial Modeling Prep | Optional fundamentals provider | Free and paid API tiers | Not active unless `FMP_API_KEY` is set |
| OpenAlgo | Optional self-hosted market data adapter | Self-hosted infrastructure plus broker/API costs | Not active unless configured |

## Anthropic Claude

How it is used:

- `services/ai/report-generator.ts` generates the core report payload.
- `services/ai/metric-brief.ts` generates the metric brief and detailed insight sections.
- `domain/report-cache.ts` calls these generators when a report is not usable from cache.
- Generated reports are cached for 24 hours, so repeated views of the same ticker should be cache hits.

Current configuration:

- `ANTHROPIC_API_KEY` enables Claude generation.
- `CLAUDE_MODEL=claude-sonnet-4-6` is configured locally.
- If `CLAUDE_MODEL` is absent, the code falls back to `claude-haiku-4-5`.

Cost model:

- Claude Sonnet 4.6: $3 per 1M input tokens and $15 per 1M output tokens.
- Claude Haiku 4.5: $1 per 1M input tokens and $5 per 1M output tokens.
- Source: [Anthropic Claude pricing](https://platform.claude.com/docs/en/about-claude/pricing) and [Claude Sonnet page](https://www.anthropic.com/claude/sonnet).

Estimated cost:

| Scope | Estimate |
| --- | ---: |
| Fresh uncached query on Sonnet 4.6 | ~$0.04 to $0.06 |
| Fresh uncached query in INR | ~Rs 4 to Rs 6 |
| Cache hit | ~$0 AI cost |
| Total Claude spend to date | ~$22 to $33 |
| 30-day run-rate at current usage | ~$33 to $50/month |

Notes:

- These are estimates because the app does not persist exact token usage.
- The largest avoidable cost lever is cache behavior. Cache hits avoid AI generation.
- Switching from Sonnet 4.6 to Haiku 4.5 would likely reduce AI cost by about two thirds, but quality should be checked before changing production behavior.

## Vercel

How it is used:

- Hosts the Next.js production app.
- Runs server-side routes such as `/api/reports/[ticker]`, `/api/resolve`, `/api/movers`, and `/api/dashboard`.
- Stores production environment variables.
- Receives Upstox token updates through `app/api/upstox/callback/route.ts` when Vercel credentials are configured.
- Provides Vercel Analytics through `@vercel/analytics`.

Current project metadata:

- Vercel project name: `metric-stocks-analyser`
- Local project config is present in `.vercel/project.json`.

Cost model:

- Vercel Hobby is free for eligible personal/non-commercial usage.
- Vercel Pro starts at $20 per month and is billed based on team seats, paid add-ons, and usage.
- Source: [Vercel pricing](https://vercel.com/pricing) and [Vercel Pro plan docs](https://vercel.com/docs/plans/pro-plan).

Estimated cost:

- Exact monthly cost requires checking the Vercel billing dashboard.
- If this is on Hobby and within limits, direct platform cost may be $0.
- If this is on Pro, expect at least $20/month per paid seat before extra usage or add-ons.

## Neon Postgres

How it is used:

- Stores generated reports in `reports`.
- Stores analysis job records in `generation_jobs`.
- Stores product events in `product_events`.
- Powers the internal dashboard.

Current configuration:

- `DATABASE_URL` points to a Neon/Postgres database.
- Current database size is about 9.6 MB.

Cost model:

- Neon has a Free plan at $0 with storage and compute limits.
- Neon Launch is usage based, with public pricing showing typical spend around $15/month for intermittent load and 1 GB.
- Source: [Neon pricing](https://neon.com/pricing).

Estimated cost:

- At the current 9.6 MB database size, storage cost should be negligible.
- If the project is on the Neon Free plan, expected direct database cost is $0.
- If the project is on a paid plan, check Neon billing for the plan minimum and compute hours.

## Market Data Providers

### Yahoo Finance

How it is used:

- `services/marketData/yahoo.ts` resolves tickers and fetches quotes, chart metadata, 52-week range, sector, industry, and basic valuation data.
- `MARKET_DATA_PROVIDER=yahoo` is currently configured locally.

Cost model:

- No API key is used by this app.
- Direct software cost is $0.

Operational note:

- The README correctly treats Yahoo as a temporary MVP bridge, not a licensed production data vendor. The business risk is data reliability/licensing, not direct usage cost.

### Upstox

How it is used:

- `services/marketData/upstox.ts` can provide broker-backed quote data.
- `services/fundamentals/upstox.ts` can provide key ratios and fundamentals.
- `app/api/upstox/callback/route.ts` handles token refresh.

Current configuration:

- Upstox keys and access token are present locally.
- The market data provider is currently set to Yahoo, so Upstox is configured but not the selected primary provider.

Cost model:

- Upstox public trading API page says trading and data APIs are free of cost, with brokerage applying to orders.
- This app uses read-only market data and fundamentals, not order placement.
- Source: [Upstox trading API](https://upstox.com/trading-api/) and [Upstox API overview](https://upstox.com/developer/api-documentation/api-overview/).

Estimated cost:

- Expected direct software/API cost for current read-only usage: $0.
- Brokerage/order charges are not relevant unless the app starts placing trades.

### Tradient

How it is used:

- `services/tradient.ts` calls Tradient market news and technical indicator endpoints.
- It enriches report pages with news sentiment and technical signals.
- If Tradient fails or has limited matching news, the app also uses Google News RSS.

Cost model:

- Tradient pricing page says API access is free.
- Source: [Tradient pricing](https://tradient.org/pricing).

Estimated cost:

- Expected direct software/API cost: $0.

### Google News RSS

How it is used:

- `services/tradient.ts` uses Google News RSS as a web news fallback.

Cost model:

- No paid API key is used.
- Expected direct software cost: $0.

### Financial Modeling Prep

How it is used:

- Optional adapter in `services/marketData/fmp.ts` and `services/fundamentals/fmp.ts`.
- Only active if `FMP_API_KEY` is configured and the provider path selects it.

Current configuration:

- No `FMP_API_KEY` is present in the local environment variable list.

Cost model:

- FMP has a free plan and paid plans starting at public listed monthly tiers.
- Source: [FMP pricing](https://site.financialmodelingprep.com/developer/docs/pricing).

Estimated cost:

- Current cost: $0 unless a paid FMP key is added.

### OpenAlgo

How it is used:

- Optional market data adapter in `services/marketData/openalgo.ts`.
- Requires `OPENALGO_BASE_URL` and `OPENALGO_API_KEY`.

Current configuration:

- Not configured locally.

Cost model:

- OpenAlgo is self-hosted. Cost depends on where it is hosted and broker/data provider charges.
- Current cost in this app: $0 unless enabled.

## Analytics

### Google Analytics

How it is used:

- `components/google-analytics.tsx` loads Google Analytics if `NEXT_PUBLIC_GA_MEASUREMENT_ID` is set.
- `lib/gtag.ts` sends page views and events.

Cost model:

- Standard Google Analytics is free.
- Source: [Google Analytics](https://marketingplatform.google.com/about/analytics/).

Estimated cost:

- Expected cost: $0.

### Vercel Analytics

How it is used:

- `app/layout.tsx` includes `Analytics` from `@vercel/analytics/next`.

Cost model:

- Cost depends on the Vercel plan and analytics usage limits.
- Check Vercel billing and usage dashboard for exact cost.

Estimated cost:

- Unknown from code alone.

## Gemini API

How it is used:

- Gemini keys and model names exist in the local environment.
- Current main report generation code uses Anthropic Claude.
- Historical stored reports include a few Gemini-generated rows, so Gemini was used earlier or in a previous version.

Current configuration:

- `GOOGLE_GENERATIVE_AI_API_KEY`
- `GEMINI_MODEL=gemini-2.5-flash`
- `GEMINI_FALLBACK_MODELS`

Cost model:

- Gemini API pricing is per token and differs by model and tier.
- Source: [Gemini API pricing](https://ai.google.dev/gemini-api/docs/pricing).

Estimated cost:

- Current main path cost: $0 if no Gemini calls are active.
- Historical Gemini usage appears small in the database.

## Current Monthly Run-Rate

Observed period: 2026-05-26 to 2026-06-14.

| Component | Monthly Estimate |
| --- | ---: |
| Claude Sonnet 4.6 AI usage | ~$33 to $50/month |
| Vercel | $0 if Hobby, or $20+/month if Pro |
| Neon | $0 if Free, otherwise plan/usage dependent |
| Google Analytics | $0 |
| Yahoo Finance direct cost | $0 |
| Upstox read-only API usage | $0 |
| Tradient | $0 |
| Google News RSS | $0 |
| Gemini | $0 current main-path estimate |
| FMP | $0 unless enabled |
| OpenAlgo | $0 unless enabled |

Practical expected bill today:

- If Vercel and Neon are both on free tiers: roughly the Claude usage only, about $33 to $50/month at current usage.
- If Vercel is Pro with one paid seat: add at least $20/month.
- If Neon is paid: add the Neon plan minimum and usage from the Neon dashboard.

## Gaps To Fix

The main missing piece is exact AI usage logging. Add fields to either `generation_jobs` or a separate `ai_usage_events` table:

- provider
- model
- operation, such as `report_payload`, `report_insights`, or `metric_brief`
- input_tokens
- output_tokens
- total_tokens
- estimated_cost_usd
- ticker
- generation_job_id
- created_at

This would let us report exact per-query cost instead of estimating from stored report size.

## Billing Dashboards To Check

Use these dashboards to reconcile this document with real invoices:

- Anthropic Console billing for exact Claude token spend.
- Vercel billing for plan, seats, analytics, bandwidth, and function usage.
- Neon billing for plan, compute hours, storage, branches, and backups.
- Google AI Studio or Google Cloud billing for any Gemini spend.
- Upstox developer/broker account for any charges if trading APIs are introduced later.
- FMP dashboard if `FMP_API_KEY` is added.
