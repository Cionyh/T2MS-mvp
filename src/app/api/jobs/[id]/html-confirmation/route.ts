import { NextRequest, NextResponse } from "next/server";
import { verifyWorker } from "@/lib/worker-helpers";
import { prisma } from "@/lib/prisma";

interface Params {
  id: string;
}

/**
 * POST /api/jobs/:id/html-confirmation
 * Worker attestation that customer HTML has been updated.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Params }
) {
  try {
    const worker = await verifyWorker();

    if (!worker) {
      return NextResponse.json(
        { error: "Only workers can confirm HTML updates" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const confirmed = body.confirmed === true;

    const job = await prisma.installJob.findUnique({
      where: { id: params.id },
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    if (job.assignedWorkerId !== worker.id) {
      return NextResponse.json(
        { error: "You can only update jobs assigned to you" },
        { status: 403 }
      );
    }

    const updatedJob = await prisma.installJob.update({
      where: { id: params.id },
      data: {
        htmlUpdatedConfirmed: confirmed,
        htmlUpdatedConfirmedAt: confirmed ? new Date() : null,
      },
      select: {
        id: true,
        htmlUpdatedConfirmed: true,
        htmlUpdatedConfirmedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      job: updatedJob,
    });
  } catch (error: unknown) {
    console.error("[JOBS_HTML_CONFIRMATION]", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
