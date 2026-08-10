-- Separate announcement-page logo and background from widget images
ALTER TABLE "Client" ADD COLUMN IF NOT EXISTS "hostedLogoUrl" TEXT;
ALTER TABLE "Client" ADD COLUMN IF NOT EXISTS "hostedBackgroundImageUrl" TEXT;
