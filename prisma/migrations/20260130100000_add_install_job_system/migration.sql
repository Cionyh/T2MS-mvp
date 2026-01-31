-- CreateTable
CREATE TABLE "customer" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "smsConsentConfirmedAt" TIMESTAMP(3),
    "onboardingCompletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "install_job" (
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

-- CreateTable
CREATE TABLE "worker" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "availability" TEXT NOT NULL DEFAULT 'OFF_SHIFT',
    "maxActiveJobs" INTEGER NOT NULL DEFAULT 2,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "worker_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proof" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "proof_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "worker_payout" (
    "id" TEXT NOT NULL,
    "workerId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'EARNED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paidAt" TIMESTAMP(3),

    CONSTRAINT "worker_payout_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "customer_userId_key" ON "customer"("userId");

-- CreateIndex
CREATE INDEX "install_job_status_idx" ON "install_job"("status");

-- CreateIndex
CREATE INDEX "install_job_worker_idx" ON "install_job"("assignedWorkerId", "status");

-- CreateIndex
CREATE INDEX "install_job_customer_idx" ON "install_job"("customerId");

-- CreateIndex
CREATE UNIQUE INDEX "worker_userId_key" ON "worker"("userId");

-- CreateIndex
CREATE INDEX "worker_availability_idx" ON "worker"("availability");

-- AddForeignKey
ALTER TABLE "customer" ADD CONSTRAINT "customer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "install_job" ADD CONSTRAINT "install_job_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "install_job" ADD CONSTRAINT "install_job_assignedWorkerId_fkey" FOREIGN KEY ("assignedWorkerId") REFERENCES "worker"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "worker" ADD CONSTRAINT "worker_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proof" ADD CONSTRAINT "proof_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "install_job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "worker_payout" ADD CONSTRAINT "worker_payout_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "worker"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "worker_payout" ADD CONSTRAINT "worker_payout_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "install_job"("id") ON DELETE CASCADE ON UPDATE CASCADE;
