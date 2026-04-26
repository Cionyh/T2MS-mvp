-- Admin-managed inbound Twilio destination numbers.
CREATE TABLE "inbound_twilio_number" (
  "id" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "normalizedPhone" TEXT NOT NULL,
  "label" TEXT,
  "purpose" TEXT NOT NULL DEFAULT 'MAIN',
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "inbound_twilio_number_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "inbound_twilio_number_normalizedPhone_key"
  ON "inbound_twilio_number"("normalizedPhone");

CREATE INDEX "inbound_twilio_number_isActive_idx"
  ON "inbound_twilio_number"("isActive");
