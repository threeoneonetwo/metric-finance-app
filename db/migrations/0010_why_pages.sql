-- "Why did this stock move" pages (/why/[symbol]/[date]). One row per stock per trading session, written by the instant
-- explainer the first time anyone asks about that session (and by the daily job for the biggest movers).
CREATE TABLE IF NOT EXISTS "why_pages" (
  "symbol" text NOT NULL,
  "session_date" date NOT NULL,
  "content" jsonb NOT NULL,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("symbol", "session_date")
);

CREATE INDEX IF NOT EXISTS "why_pages_session_idx" ON "why_pages" ("session_date" DESC);
