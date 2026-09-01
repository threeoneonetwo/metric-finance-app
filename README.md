# Metric Finance

Metric Finance is a personalized weekly newsletter for young professionals
investing directly in US equities: pick the stocks you follow and get a plain-English
briefing on price action, fundamentals, peers, and the news that matters.

This repo currently ships the landing page and signup flow only. The product
is undergoing a rebuild into the full newsletter service, so the market-data,
report-generation, and broker-integration layers that previously lived here
have been removed.

## Tech Stack

- Next.js 15
- React 19
- Postgres with Drizzle ORM
- Tailwind CSS 4

## Getting Started

Install dependencies:

```bash
npm install
```

Create a local environment file:

```bash
cp .env.example .env.local
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Database

The app uses Postgres through Drizzle ORM. Set `DATABASE_URL` in `.env.local`
for local development and in Vercel project environment variables for
production.

Create or update the database tables:

```bash
npm run db:migrate
```

The only table in active use today is `product_events`, which backs basic
product analytics (landing page views, etc.).

## Product Analytics

PostHog tracks product usage when these public environment variables are set:

```bash
NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN=your_posthog_project_token
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```

Microsoft Clarity records sessions and generates heatmaps for the Metric
Finance project. The project ID can be overridden per environment when needed:

```bash
NEXT_PUBLIC_CLARITY_PROJECT_ID=your_clarity_project_id
```

Set `localStorage.metric_owner = "1"` in your browser to exclude your own
testing from GA, PostHog, and Microsoft Clarity.

## Scripts

```bash
npm run dev
npm run lint
npm run build
npm run db:generate
npm run db:migrate
```
