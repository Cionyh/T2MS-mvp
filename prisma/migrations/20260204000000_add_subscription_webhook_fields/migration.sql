-- AlterTable
ALTER TABLE "subscription" ADD COLUMN "cancelAt" TIMESTAMP(3);
ALTER TABLE "subscription" ADD COLUMN "canceledAt" TIMESTAMP(3);
ALTER TABLE "subscription" ADD COLUMN "endedAt" TIMESTAMP(3);
ALTER TABLE "subscription" ADD COLUMN "updatedAt" TIMESTAMP(3);
