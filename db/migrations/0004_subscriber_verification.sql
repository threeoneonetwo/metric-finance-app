ALTER TABLE "subscribers" ADD COLUMN IF NOT EXISTS "name" text;
ALTER TABLE "subscribers" ADD COLUMN IF NOT EXISTS "verified_at" timestamp with time zone;
ALTER TABLE "subscribers" ADD COLUMN IF NOT EXISTS "verification_token" text UNIQUE;
ALTER TABLE "subscribers" ALTER COLUMN "active" SET DEFAULT false;
