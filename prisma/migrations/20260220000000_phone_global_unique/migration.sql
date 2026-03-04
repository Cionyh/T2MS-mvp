-- Enforce one phone, one website globally.
-- Remove duplicate phone numbers (keep one row per phone, the one with smallest id).
DELETE FROM "public"."phone_number" a
USING "public"."phone_number" b
WHERE a.phone = b.phone AND a.id > b.id;

-- Drop the composite unique constraint (phone, clientId)
DROP INDEX IF EXISTS "public"."phone_number_phone_clientId_key";

-- Add global unique constraint on phone
CREATE UNIQUE INDEX "phone_number_phone_key" ON "public"."phone_number"("phone");
