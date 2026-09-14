CREATE TABLE IF NOT EXISTS "briefings" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "subscriber_id" uuid NOT NULL,
  "tickers" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "html" text NOT NULL,
  "text" text NOT NULL,
  "sent_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "briefings_subscriber_id_sent_at_idx" ON "briefings" ("subscriber_id", "sent_at" DESC);
