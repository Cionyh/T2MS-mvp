-- CreateTable (idempotent: skip if table already exists)
CREATE TABLE IF NOT EXISTS "customer" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "smsConsentConfirmedAt" TIMESTAMP(3),
    "onboardingCompletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customer_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "install_job" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "installType" TEXT NOT NULL,
    "websiteUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "preferredPlacement" TEXT,
    "accessMethod" TEXT NOT NULL,
    "accessCredentials" TEXT,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'QUEUED',
    "priority" INTEGER NOT NULL DEFAULT 0,
    "assignedWorkerId" TEXT,
    "checklistCompleted" BOOLEAN NOT NULL DEFAULT false,
    "proofUploaded" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "install_job_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "worker" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "availability" TEXT NOT NULL DEFAULT 'OFF_SHIFT',
    "maxActiveJobs" INTEGER NOT NULL DEFAULT 2,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "worker_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "proof" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "proof_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "worker_payout" (
    "id" TEXT NOT NULL,
    "workerId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'EARNED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paidAt" TIMESTAMP(3),

    CONSTRAINT "worker_payout_pkey" PRIMARY KEY ("id")
);

-- CreateIndex (idempotent)
CREATE UNIQUE INDEX IF NOT EXISTS "customer_userId_key" ON "customer"("userId");
CREATE INDEX IF NOT EXISTS "install_job_status_idx" ON "install_job"("status");
CREATE INDEX IF NOT EXISTS "install_job_worker_idx" ON "install_job"("assignedWorkerId", "status");
CREATE INDEX IF NOT EXISTS "install_job_customer_idx" ON "install_job"("customerId");
CREATE UNIQUE INDEX IF NOT EXISTS "worker_userId_key" ON "worker"("userId");
CREATE INDEX IF NOT EXISTS "worker_availability_idx" ON "worker"("availability");

-- AddForeignKey (idempotent: ignore if constraint already exists)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'customer_userId_fkey') THEN
        ALTER TABLE "customer" ADD CONSTRAINT "customer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'install_job_customerId_fkey') THEN
        ALTER TABLE "install_job" ADD CONSTRAINT "install_job_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'install_job_assignedWorkerId_fkey') THEN
        ALTER TABLE "install_job" ADD CONSTRAINT "install_job_assignedWorkerId_fkey" FOREIGN KEY ("assignedWorkerId") REFERENCES "worker"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'worker_userId_fkey') THEN
        ALTER TABLE "worker" ADD CONSTRAINT "worker_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'proof_jobId_fkey') THEN
        ALTER TABLE "proof" ADD CONSTRAINT "proof_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "install_job"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'worker_payout_workerId_fkey') THEN
        ALTER TABLE "worker_payout" ADD CONSTRAINT "worker_payout_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "worker"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'worker_payout_jobId_fkey') THEN
        ALTER TABLE "worker_payout" ADD CONSTRAINT "worker_payout_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "install_job"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
