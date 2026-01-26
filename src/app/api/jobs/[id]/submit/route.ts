import { NextRequest, NextResponse } from "next/server";
import { verifyWorker } from "@/lib/worker-helpers";
import { prisma } from "@/lib/prisma";
import { INSTALL_JOB_STATUS } from "@/lib/job-status";

interface Params {
  id: string;
}

/**
 * POST /api/jobs/:id/submit
 * Submit job for QA
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Params }
) {
  try {
    const worker = await verifyWorker();

    if (!worker) {
      return NextResponse.json(
        { error: "Only workers can submit jobs" },
        { status: 403 }
      );
    }

    const job = await prisma.installJob.findUnique({
      where: { id: params.id },
      include: {
        proofs: true,
      },
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    if (job.assignedWorkerId !== worker.id) {
      return NextResponse.json(
        { error: "You can only submit jobs assigned to you" },
        { status: 403 }
      );
    }

    // Validate checklist is complete
    if (!job.checklistCompleted) {
      return NextResponse.json(
        { error: "QA checklist must be completed before submission" },
        { status: 400 }
      );
    }

    // Validate all proofs are uploaded
    const hasDesktop = job.proofs.some((p) => p.type === "desktop");
    const hasMobile = job.proofs.some((p) => p.type === "mobile");
    const hasMessage = job.proofs.some((p) => p.type === "message");

    if (!hasDesktop || !hasMobile || !hasMessage) {
      return NextResponse.json(
        {
          error: "All proof types must be uploaded (desktop, mobile, message)",
          missing: {
            desktop: !hasDesktop,
            mobile: !hasMobile,
            message: !hasMessage,
          },
        },
        { status: 400 }
      );
    }

    // Update job status to SUBMITTED_FOR_QA
    const updatedJob = await prisma.installJob.update({
      where: { id: params.id },
      data: {
        status: INSTALL_JOB_STATUS.SUBMITTED_FOR_QA,
      },
    });

    return NextResponse.json({
      success: true,
      job: updatedJob,
      message: "Job submitted for QA successfully",
    });
  } catch (error: any) {
    console.error("[JOBS_SUBMIT]", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
