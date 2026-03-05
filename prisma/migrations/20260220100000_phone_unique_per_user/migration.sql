-- Revert to unique per (phone, clientId): same phone can be on different sites (e.g. different users).
-- Drop global unique on phone
DROP INDEX IF EXISTS "public"."phone_number_phone_key";

-- Restore composite unique: same phone cannot be added twice to the same client
CREATE UNIQUE INDEX "phone_number_phone_clientId_key" ON "public"."phone_number"("phone", "clientId");
