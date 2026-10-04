CREATE TABLE IF NOT EXISTS "learn_stock_pages" (
  "symbol" text PRIMARY KEY NOT NULL,
  "content" jsonb NOT NULL,
  "facts" jsonb NOT NULL,
  "generated_at" timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "learn_articles" (
  "slug" text PRIMARY KEY NOT NULL,
  "kind" text NOT NULL,
  "title" text NOT NULL,
  "description" text NOT NULL,
  "intro" text NOT NULL,
  "sections" jsonb NOT NULL,
  "extra" jsonb,
  "published_on" date NOT NULL,
  "created_at" timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "learn_articles_kind_published_idx" ON "learn_articles" ("kind", "published_on" DESC);
