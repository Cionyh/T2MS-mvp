import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { WORKER_AVAILABILITY } from "@/lib/job-status";

interface Params {
  id: string;
}

/**
 * GET /api/admin/workers/:id
 * Get worker details (admin only)
 */
export async function GET(
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

    const worker = await prisma.worker.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
          },
        },
        assignedJobs: {
          include: {
            customer: {
              include: {
                user: {
                  select: {
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        payouts: {
          include: {
            job: {
              select: {
                id: true,
                platform: true,
                installType: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!worker) {
      return NextResponse.json(
        { error: "Worker not found" },
        { status: 404 }
      );
    }

    // Get stats
    const activeJobCount = await prisma.installJob.count({
      where: {
        assignedWorkerId: worker.id,
        status: {
          in: ["ASSIGNED", "IN_PROGRESS", "SUBMITTED_FOR_QA", "NEEDS_FIX"],
        },
      },
    });

    const completedJobCount = await prisma.installJob.count({
      where: {
        assignedWorkerId: worker.id,
        status: "COMPLETED",
      },
    });

    const totalEarnings = await prisma.workerPayout.aggregate({
      where: {
        workerId: worker.id,
        status: {
          in: ["EARNED", "APPROVED", "PAID"],
        },
      },
      _sum: {
        amount: true,
      },
    });

    return NextResponse.json({
      ...worker,
      activeJobCount,
      completedJobCount,
      totalEarnings: totalEarnings._sum.amount || 0,
    });
  } catch (error: any) {
    console.error("[ADMIN_WORKERS_GET_ID]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/workers/:id
 * Update worker (admin only)
 */
export async function PATCH(
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
    const { availability, maxActiveJobs } = body;

    if (availability && !Object.values(WORKER_AVAILABILITY).includes(availability)) {
      return NextResponse.json(
        { error: "Invalid availability status" },
        { status: 400 }
      );
    }

    if (maxActiveJobs !== undefined && (maxActiveJobs < 1 || maxActiveJobs > 10)) {
      return NextResponse.json(
        { error: "maxActiveJobs must be between 1 and 10" },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (availability) updateData.availability = availability;
    if (maxActiveJobs !== undefined) updateData.maxActiveJobs = maxActiveJobs;

    const worker = await prisma.worker.update({
      where: { id: params.id },
      data: updateData,
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

    return NextResponse.json({
      success: true,
      worker,
      message: "Worker updated successfully",
    });
  } catch (error: any) {
    console.error("[ADMIN_WORKERS_PATCH]", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/workers/:id
 * Delete worker (admin only)
 */
export async function DELETE(
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

    // Check if worker has active jobs
    const activeJobCount = await prisma.installJob.count({
      where: {
        assignedWorkerId: params.id,
        status: {
          in: ["ASSIGNED", "IN_PROGRESS", "SUBMITTED_FOR_QA", "NEEDS_FIX"],
        },
      },
    });

    if (activeJobCount > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete worker with ${activeJobCount} active job(s). Please reassign or complete jobs first.`,
        },
        { status: 400 }
      );
    }

    await prisma.worker.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: "Worker deleted successfully",
    });
  } catch (error: any) {
    console.error("[ADMIN_WORKERS_DELETE]", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
