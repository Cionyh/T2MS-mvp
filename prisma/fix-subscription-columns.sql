-- Fix: Add columns required by Better Auth Stripe webhook
ALTER TABLE "subscription" ADD COLUMN IF NOT EXISTS "cancelAt" TIMESTAMP(3);
ALTER TABLE "subscription" ADD COLUMN IF NOT EXISTS "canceledAt" TIMESTAMP(3);
ALTER TABLE "subscription" ADD COLUMN IF NOT EXISTS "endedAt" TIMESTAMP(3);
ALTER TABLE "subscription" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3);
