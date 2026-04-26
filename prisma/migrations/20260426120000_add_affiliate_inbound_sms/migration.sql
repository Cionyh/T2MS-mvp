-- CreateTable
CREATE TABLE "affiliate_inbound_sms" (
    "id" TEXT NOT NULL,
    "fromPhone" TEXT NOT NULL,
    "toPhone" TEXT NOT NULL,
    "body" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "affiliate_inbound_sms_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "affiliate_inbound_sms_createdAt_idx" ON "affiliate_inbound_sms"("createdAt");
