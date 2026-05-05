import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { INSTALL_JOB_STATUS, isValidStatusTransition } from "@/lib/job-status";
import { sendWidgetLiveEmailForJob } from "@/lib/widget-live-notify";

interface Params {
  id: string;
}

/**
 * POST /api/admin/jobs/:id/review
 * Review QA submission - approve or reject (admin only)
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Params }
) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { action, notes } = body; // action: "approve" | "reject"

    if (!action || !["approve", "reject"].includes(action)) {
      return NextResponse.json(
        { error: "action must be 'approve' or 'reject'" },
        { status: 400 }
      );
    }

    // Get the job
    const job = await prisma.installJob.findUnique({
      where: { id: params.id },
    });

    if (!job) {
      return NextResponse.json(
        { error: "Job not found" },
        { status: 404 }
      );
    }

    // Only jobs in SUBMITTED_FOR_QA can be reviewed
    if (job.status !== INSTALL_JOB_STATUS.SUBMITTED_FOR_QA) {
      return NextResponse.json(
        { error: `Job is not in SUBMITTED_FOR_QA status. Current status: ${job.status}` },
        { status: 400 }
      );
    }

    let newStatus: string;
    if (action === "approve") {
      newStatus = INSTALL_JOB_STATUS.COMPLETED;
    } else {
      newStatus = INSTALL_JOB_STATUS.NEEDS_FIX;
    }

    // Validate status transition
    if (!isValidStatusTransition(job.status as any, newStatus as any)) {
      return NextResponse.json(
        { error: `Invalid status transition from ${job.status} to ${newStatus}` },
        { status: 400 }
      );
    }

    // Update the job
    const updatedJob = await prisma.installJob.update({
      where: { id: params.id },
      data: {
        status: newStatus,
        notes: notes ? `${job.notes || ""}\n\n[Admin Review ${new Date().toISOString()}]: ${notes}`.trim() : job.notes,
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

    // If approved, auto-publish the associated site and create payout
    if (action === "approve" && updatedJob.clientId) {
      await prisma.client.update({
        where: { id: updatedJob.clientId },
        data: { pinned: true },
      }).catch((err) => console.error("[ADMIN_JOBS_REVIEW] Auto-publish site failed:", err));
    }

    if (action === "approve") {
      sendWidgetLiveEmailForJob(params.id).catch((err: unknown) =>
        console.error("[ADMIN_JOBS_REVIEW] Widget Live email failed:", err)
      );
    }

    if (action === "approve" && updatedJob.assignedWorkerId) {
      const existingPayout = await prisma.workerPayout.findFirst({
        where: {
          jobId: updatedJob.id,
          workerId: updatedJob.assignedWorkerId,
        },
      });

      if (!existingPayout) {
        // Worker rate per completed install (same for all install types)
        const payoutAmount = 3;

        await prisma.workerPayout.create({
          data: {
            workerId: updatedJob.assignedWorkerId,
            jobId: updatedJob.id,
            amount: payoutAmount,
            status: "EARNED",
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      job: updatedJob,
      message: action === "approve" ? "Job approved and marked as completed" : "Job rejected and marked as needs fix",
    });
  } catch (error: any) {
    console.error("[ADMIN_JOBS_REVIEW]", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
