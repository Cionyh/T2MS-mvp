import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { WORKER_AVAILABILITY } from "@/lib/job-status";

/**
 * Verify if user is a worker
 * Returns worker record if valid, null otherwise
 */
export async function verifyWorker() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return null;
  }

  const worker = await prisma.worker.findUnique({
    where: { userId: session.user.id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return worker;
}

/**
 * Get worker's active job count
 */
export async function getWorkerActiveJobCount(workerId: string): Promise<number> {
  const activeStatuses = ["ASSIGNED", "IN_PROGRESS", "SUBMITTED_FOR_QA", "NEEDS_FIX"];
  
  const count = await prisma.installJob.count({
    where: {
      assignedWorkerId: workerId,
      status: {
        in: activeStatuses,
      },
    },
  });

  return count;
}

/**
 * Check if worker can claim a job
 */
export async function canWorkerClaimJob(workerId: string): Promise<{
  canClaim: boolean;
  reason?: string;
}> {
  const worker = await prisma.worker.findUnique({
    where: { id: workerId },
  });

  if (!worker) {
    return { canClaim: false, reason: "Worker not found" };
  }

  if (worker.availability !== WORKER_AVAILABILITY.ON_SHIFT) {
    return {
      canClaim: false,
      reason: `Worker must be ${WORKER_AVAILABILITY.ON_SHIFT} to claim jobs`,
    };
  }

  const activeJobCount = await getWorkerActiveJobCount(workerId);
  
  if (activeJobCount >= worker.maxActiveJobs) {
    return {
      canClaim: false,
      reason: `Worker has reached maximum active jobs (${worker.maxActiveJobs})`,
    };
  }

  return { canClaim: true };
}
