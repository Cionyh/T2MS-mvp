-- Fix: Add user profile columns (state, country, businessCategory)
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "state" TEXT;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "country" TEXT;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "businessCategory" TEXT;
