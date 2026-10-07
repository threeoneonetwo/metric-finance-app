-- The market facts each brief was written from, so follow up questions are answered from the same data.
-- Nullable: briefs written before this column existed simply have no stored facts.
ALTER TABLE "briefings" ADD COLUMN IF NOT EXISTS "facts" jsonb;
