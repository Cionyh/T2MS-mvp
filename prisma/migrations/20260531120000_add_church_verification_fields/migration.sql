-- AlterTable
ALTER TABLE "onboarding" ADD COLUMN "churchOrganizationName" TEXT;
ALTER TABLE "onboarding" ADD COLUMN "churchVerificationStatus" TEXT;
ALTER TABLE "onboarding" ADD COLUMN "churchVerifiedAt" TIMESTAMP(3);
ALTER TABLE "onboarding" ADD COLUMN "churchPriceLockedUntil" TIMESTAMP(3);
