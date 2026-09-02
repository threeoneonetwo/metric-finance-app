CREATE TABLE IF NOT EXISTS "subscribers" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "email" text NOT NULL UNIQUE,
  "tickers" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "active" boolean DEFAULT true NOT NULL,
  "unsubscribe_token" text NOT NULL UNIQUE,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "last_sent_at" timestamp with time zone
);

CREATE INDEX IF NOT EXISTS "subscribers_active_idx" ON "subscribers" ("active");
