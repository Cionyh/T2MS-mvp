-- AlterTable
ALTER TABLE "install_job" ADD COLUMN "htmlUpdatedConfirmed" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "install_job" ADD COLUMN "htmlUpdatedConfirmedAt" TIMESTAMP(3);
