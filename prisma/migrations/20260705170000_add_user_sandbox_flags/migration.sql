-- AlterTable
ALTER TABLE "user" ADD COLUMN "registered_from_sandbox" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "user" ADD COLUMN "migrated_to_live_at" TIMESTAMP(3);
