-- AlterTable
ALTER TABLE "Client" ADD COLUMN "hostedSlug" TEXT;
ALTER TABLE "Client" ADD COLUMN "hostedEnabled" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Client" ADD COLUMN "hostedIntroText" TEXT;
ALTER TABLE "Client" ADD COLUMN "hostedPublishedAt" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "Client_hostedSlug_key" ON "Client"("hostedSlug");
