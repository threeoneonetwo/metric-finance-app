-- Product roadmap: ideas readers vote on, and their votes. Reader suggestions start as 'pending' and stay hidden until approved.
CREATE TABLE IF NOT EXISTS "roadmap_ideas" (
  "id" text PRIMARY KEY,
  "title" text NOT NULL,
  "description" text NOT NULL DEFAULT '',
  "status" text NOT NULL DEFAULT 'review',
  "pro" boolean NOT NULL DEFAULT false,
  "suggested_by" uuid,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "shipped_at" timestamptz
);

CREATE TABLE IF NOT EXISTS "roadmap_votes" (
  "subscriber_id" uuid NOT NULL,
  "idea_id" text NOT NULL REFERENCES "roadmap_ideas"("id") ON DELETE CASCADE,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY ("subscriber_id", "idea_id")
);

CREATE INDEX IF NOT EXISTS "roadmap_votes_idea_idx" ON "roadmap_votes" ("idea_id");

INSERT INTO "roadmap_ideas" ("id", "title", "description", "status", "pro") VALUES
  ('earnings', 'Earnings day alerts', 'Know when your stocks report earnings, and what the numbers actually mean.', 'review', false),
  ('unlimited', 'Unlimited follow up questions', 'Ask as many questions about your brief as you like.', 'review', true),
  ('more-stocks', 'More than 5 stocks', 'Follow more than five companies in one brief.', 'review', true),
  ('weekly', 'Weekly recap', 'A quick look back at how your stocks did this week.', 'review', false),
  ('big-moves', 'Big move alerts', 'Hear from us when one of your stocks jumps or drops a lot.', 'review', false),
  ('morning', 'Morning preview', 'What to keep an eye on before the market opens.', 'review', false),
  ('mobile', 'Mobile app', 'Your brief in an app, with a nudge when it is ready.', 'review', false),
  ('charts', 'Price charts in the brief', 'See how each of your stocks moved today at a glance.', 'review', false),
  ('follow-ups', 'Follow up questions', 'Ask about anything in your brief and get a simple answer.', 'shipped', false),
  ('share', 'Share your brief', 'Send Metric Finance to a friend in one tap.', 'shipped', false)
ON CONFLICT ("id") DO NOTHING;

UPDATE "roadmap_ideas" SET "shipped_at" = '2026-10-07' WHERE "id" = 'follow-ups' AND "shipped_at" IS NULL;
UPDATE "roadmap_ideas" SET "shipped_at" = '2026-10-04' WHERE "id" = 'share' AND "shipped_at" IS NULL;
