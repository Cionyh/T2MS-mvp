import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyWorker, canWorkerClaimJob } from "@/lib/worker-helpers";
import { INSTALL_JOB_STATUS } from "@/lib/job-status";

interface Params {
  id: string;
}

/**
 * PATCH /api/jobs/:id/claim
 * Worker claims a job
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Params }
) {
  try {
    const worker = await verifyWorker();

    if (!worker) {
      return NextResponse.json(
        { error: "Only workers can claim jobs" },
        { status: 403 }
      );
    }

    const job = await prisma.installJob.findUnique({
      where: { id: params.id },
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    if (job.status !== INSTALL_JOB_STATUS.QUEUED) {
      return NextResponse.json(
        { error: "Job is not available for claiming" },
        { status: 400 }
      );
    }

      // Check if worker can claim
      const { canClaim, reason } = await import("@/lib/worker-helpers").then(
        (m) => m.canWorkerClaimJob(worker.id)
      );

    if (!canClaim) {
      return NextResponse.json({ error: reason }, { status: 400 });
    }

    // Claim the job
    const updatedJob = await prisma.installJob.update({
      where: { id: params.id },
      data: {
        assignedWorkerId: worker.id,
        status: INSTALL_JOB_STATUS.ASSIGNED,
      },
      include: {
        customer: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      job: updatedJob,
      message: "Job claimed successfully",
    });
  } catch (error: any) {
    console.error("[JOBS_CLAIM]", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
