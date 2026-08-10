-- AlterTable
ALTER TABLE "Client" ADD COLUMN IF NOT EXISTS "hostedShowWebsiteLink" BOOLEAN NOT NULL DEFAULT false;
