import { NextRequest, NextResponse } from "next/server";
import { verifyWorker } from "@/lib/worker-helpers";
import { prisma } from "@/lib/prisma";

interface Params {
  id: string;
}

/**
 * POST /api/jobs/:id/checklist
 * Submit QA checklist for a job
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Params }
) {
  try {
    const worker = await verifyWorker();

    if (!worker) {
      return NextResponse.json(
        { error: "Only workers can submit checklists" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      widgetLoadsDesktop,
      widgetLoadsMobile,
      messagingUIOpens,
      testMessageSends,
      incomingMessageReachesChannel,
      replyReachesTestPhone,
      noLayoutOrConsoleErrors,
    } = body;

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

    // Validate all checklist items are true
    const allChecked =
      widgetLoadsDesktop &&
      widgetLoadsMobile &&
      messagingUIOpens &&
      testMessageSends &&
      incomingMessageReachesChannel &&
      replyReachesTestPhone &&
      noLayoutOrConsoleErrors;

    if (!allChecked) {
      return NextResponse.json(
        { error: "All checklist items must be completed" },
        { status: 400 }
      );
    }

    // Update job with checklist completion
    const updatedJob = await prisma.installJob.update({
      where: { id: params.id },
      data: {
        checklistCompleted: true,
      },
    });

    return NextResponse.json({
      success: true,
      job: updatedJob,
      message: "Checklist submitted successfully",
    });
  } catch (error: any) {
    console.error("[JOBS_CHECKLIST]", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
