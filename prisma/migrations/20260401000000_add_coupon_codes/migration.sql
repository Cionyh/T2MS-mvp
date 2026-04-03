CREATE TABLE "coupon_code" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "plan" TEXT NOT NULL,
    "durationInMonths" INTEGER NOT NULL,
    "usageLimit" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "expiresAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "coupon_code_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "coupon_redemption" (
    "id" TEXT NOT NULL,
    "couponCodeId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "subscriptionId" TEXT,
    "redeemedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "cancelledAt" TIMESTAMP(3),
    "cancellationReason" TEXT,

    CONSTRAINT "coupon_redemption_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "subscription"
ADD COLUMN "source" TEXT DEFAULT 'stripe',
ADD COLUMN "couponCodeId" TEXT;

CREATE UNIQUE INDEX "coupon_code_code_key" ON "coupon_code"("code");
CREATE UNIQUE INDEX "coupon_redemption_subscriptionId_key" ON "coupon_redemption"("subscriptionId");
CREATE INDEX "coupon_redemption_couponCodeId_idx" ON "coupon_redemption"("couponCodeId");

ALTER TABLE "coupon_redemption"
ADD CONSTRAINT "coupon_redemption_couponCodeId_fkey"
FOREIGN KEY ("couponCodeId") REFERENCES "coupon_code"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "coupon_redemption"
ADD CONSTRAINT "coupon_redemption_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "coupon_redemption"
ADD CONSTRAINT "coupon_redemption_subscriptionId_fkey"
FOREIGN KEY ("subscriptionId") REFERENCES "subscription"("id") ON DELETE SET NULL ON UPDATE CASCADE;
