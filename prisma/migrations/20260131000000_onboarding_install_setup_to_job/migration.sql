-- Move install-setup data to Customer + InstallJob only. Remove from onboarding table.
ALTER TABLE "onboarding" DROP COLUMN IF EXISTS "websiteUrls";
ALTER TABLE "onboarding" DROP COLUMN IF EXISTS "platform";
ALTER TABLE "onboarding" DROP COLUMN IF EXISTS "installType";
ALTER TABLE "onboarding" DROP COLUMN IF EXISTS "preferredPlacement";
ALTER TABLE "onboarding" DROP COLUMN IF EXISTS "accessMethod";
ALTER TABLE "onboarding" DROP COLUMN IF EXISTS "accessCredentials";
ALTER TABLE "onboarding" DROP COLUMN IF EXISTS "notes";
ALTER TABLE "onboarding" DROP COLUMN IF EXISTS "smsConsentConfirmedAt";
