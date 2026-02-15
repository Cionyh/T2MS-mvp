import { NextRequest, NextResponse } from "next/server";
import { verifyWorker, getWorkerActiveJobCount } from "@/lib/worker-helpers";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/workers/me
 * Get current worker profile and stats
 */
export async function GET(req: NextRequest) {
  try {
    const worker = await verifyWorker();

    if (!worker) {
      return NextResponse.json(
        { error: "Not a worker account" },
        { status: 403 }
      );
    }

    const activeJobCount = await getWorkerActiveJobCount(worker.id);

    // Get completed jobs count
    const completedJobsCount = await prisma.installJob.count({
      where: {
        assignedWorkerId: worker.id,
        status: "COMPLETED",
      },
    });

    // Get total earnings (sum of all EARNED payouts)
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
      worker: {
        id: worker.id,
        availability: worker.availability,
        maxActiveJobs: worker.maxActiveJobs,
        activeJobCount,
        completedJobsCount,
        totalEarnings: Number(totalEarnings._sum.amount ?? 0),
        user: worker.user,
      },
    });
  } catch (error: any) {
    console.error("[WORKERS_ME]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/workers/me
 * Update worker profile (availability, etc.)
 */
export async function PATCH(req: NextRequest) {
  try {
    const worker = await verifyWorker();

    if (!worker) {
      return NextResponse.json(
        { error: "Not a worker account" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { availability } = body;

    if (availability && !["OFF_SHIFT", "ON_SHIFT", "PAUSED"].includes(availability)) {
      return NextResponse.json(
        { error: "Invalid availability status" },
        { status: 400 }
      );
    }

    const updatedWorker = await prisma.worker.update({
      where: { id: worker.id },
      data: {
        ...(availability && { availability }),
      },
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
      worker: updatedWorker,
    });
  } catch (error: any) {
    console.error("[WORKERS_ME_PATCH]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
