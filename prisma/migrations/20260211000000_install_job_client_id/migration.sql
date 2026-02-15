-- AlterTable
ALTER TABLE "install_job" ADD COLUMN IF NOT EXISTS "clientId" TEXT;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "install_job_clientId_idx" ON "install_job"("clientId");

-- AddForeignKey (only if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'install_job_clientId_fkey'
  ) THEN
    ALTER TABLE "install_job" ADD CONSTRAINT "install_job_clientId_fkey"
      FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
