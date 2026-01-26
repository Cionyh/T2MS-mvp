import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { INSTALL_JOB_STATUS } from "@/lib/job-status";

interface Params {
  id: string;
}

/**
 * PATCH /api/admin/jobs/:id/reassign
 * Reassign a job to a different worker (admin only)
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
    const { workerId } = body;

    if (workerId === undefined) {
      return NextResponse.json(
        { error: "workerId is required" },
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

    // If workerId is null, unassign the job (release back to queue)
    if (workerId === null) {
      const updatedJob = await prisma.installJob.update({
        where: { id: params.id },
        data: {
          assignedWorkerId: null,
          status: INSTALL_JOB_STATUS.QUEUED,
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
        },
      });

      return NextResponse.json({
        success: true,
        job: updatedJob,
        message: "Job released back to queue",
      });
    }

    // Verify the worker exists
    const worker = await prisma.worker.findUnique({
      where: { id: workerId },
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

    if (!worker) {
      return NextResponse.json(
        { error: "Worker not found" },
        { status: 404 }
      );
    }

    // Update the job
    const updatedJob = await prisma.installJob.update({
      where: { id: params.id },
      data: {
        assignedWorkerId: workerId,
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
      },
    });

    return NextResponse.json({
      success: true,
      job: updatedJob,
      message: `Job reassigned to ${worker.user.name}`,
    });
  } catch (error: any) {
    console.error("[ADMIN_JOBS_REASSIGN]", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
