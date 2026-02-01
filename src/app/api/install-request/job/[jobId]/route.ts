import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { INSTALL_JOB_STATUS } from "@/lib/job-status";

/**
 * GET /api/install-request/job/[jobId]
 * Returns the install job if it belongs to the current user and status is PENDING_PAYMENT.
 * Used when user clicks "Complete payment" from install-requests list.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { jobId } = await params;
    if (!jobId) {
      return NextResponse.json({ error: "Missing jobId" }, { status: 400 });
    }

    const customer = await prisma.customer.findUnique({
      where: { userId: session.user.id },
      include: {
        installJobs: {
          where: { id: jobId, status: INSTALL_JOB_STATUS.PENDING_PAYMENT },
        },
      },
    });

    const job = customer?.installJobs?.[0];
    if (!job) {
      return NextResponse.json(
        { error: "Job not found or payment already completed" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: job.id,
      status: job.status,
      platform: job.platform,
      installType: job.installType,
      websiteUrls: job.websiteUrls,
      createdAt: job.createdAt,
    });
  } catch (error) {
    console.error("Install request job GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
