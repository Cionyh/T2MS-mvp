import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyWorker } from "@/lib/worker-helpers";
import { INSTALL_JOB_STATUS, isValidStatusTransition } from "@/lib/job-status";

interface Params {
  id: string;
}

/**
 * GET /api/jobs/:id
 * Get job details
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Params }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const worker = await verifyWorker();

    const job = await prisma.installJob.findUnique({
      where: { id: params.id },
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
        assignedWorker: {
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
        proofs: {
          orderBy: { uploadedAt: "desc" },
        },
      },
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // Workers can only see jobs assigned to them or queued jobs
    if (worker) {
      if (
        job.status !== INSTALL_JOB_STATUS.QUEUED &&
        job.assignedWorkerId !== worker.id
      ) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    return NextResponse.json(job);
  } catch (error: any) {
    console.error("[JOBS_GET_ID]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/jobs/:id
 * Update job (claim, update status, etc.)
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Params }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { action, status, ...updateData } = body;

    const worker = await verifyWorker();

    const job = await prisma.installJob.findUnique({
      where: { id: params.id },
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // Handle claim action
    if (action === "claim") {
      if (!worker) {
        return NextResponse.json(
          { error: "Only workers can claim jobs" },
          { status: 403 }
        );
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
      });

      return NextResponse.json(updatedJob);
    }

    // Handle status update
    if (status) {
      // Validate status transition
      if (!isValidStatusTransition(job.status as any, status)) {
        return NextResponse.json(
          { error: `Invalid status transition from ${job.status} to ${status}` },
          { status: 400 }
        );
      }

      // Workers can only update their own jobs
      if (worker && job.assignedWorkerId !== worker.id) {
        return NextResponse.json(
          { error: "You can only update jobs assigned to you" },
          { status: 403 }
        );
      }

      const updatedJob = await prisma.installJob.update({
        where: { id: params.id },
        data: {
          status,
          ...updateData,
        },
      });

      return NextResponse.json(updatedJob);
    }

    // General update (only for assigned worker or admin)
    if (worker && job.assignedWorkerId !== worker.id) {
      return NextResponse.json(
        { error: "You can only update jobs assigned to you" },
        { status: 403 }
      );
    }

    const updatedJob = await prisma.installJob.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json(updatedJob);
  } catch (error: any) {
    console.error("[JOBS_PATCH]", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
