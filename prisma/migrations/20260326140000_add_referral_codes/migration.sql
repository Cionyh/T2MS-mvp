ALTER TABLE "user"
ADD COLUMN IF NOT EXISTS "referral_code" TEXT;

CREATE TABLE IF NOT EXISTS "referral_code" (
  "id" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "label" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "referral_code_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "referral_code_code_key" ON "referral_code"("code");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE constraint_name = 'user_referral_code_fkey'
      AND table_name = 'user'
  ) THEN
    ALTER TABLE "user"
    ADD CONSTRAINT "user_referral_code_fkey"
    FOREIGN KEY ("referral_code")
    REFERENCES "referral_code"("code")
    ON DELETE SET NULL
    ON UPDATE CASCADE;
  END IF;
END $$;
