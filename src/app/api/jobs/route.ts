import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyWorker } from "@/lib/worker-helpers";
import { INSTALL_JOB_STATUS } from "@/lib/job-status";

/**
 * GET /api/jobs
 * List jobs - filtered by worker if worker, all if admin
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = req.nextUrl;
    const status = searchParams.get("status");
    const workerId = searchParams.get("workerId");
    const assignedToMe = searchParams.get("assignedToMe") === "true";
    const search = searchParams.get("search");

    // Check if user is worker
    const worker = await verifyWorker();

    // Build where clause
    const where: any = {};

    if (status) {
      where.status = status;
    }

    // Search functionality (for admin)
    if (search && !worker) {
      where.OR = [
        {
          customer: {
            user: {
              OR: [
                { name: { contains: search, mode: "insensitive" } },
                { email: { contains: search, mode: "insensitive" } },
              ],
            },
          },
        },
        {
          websiteUrls: {
            hasSome: [search],
          },
        },
      ];
    }

    // If worker, only show their assigned jobs or queued jobs
    if (worker) {
      if (assignedToMe) {
        where.assignedWorkerId = worker.id;
      } else {
        // Show queued jobs or jobs assigned to this worker
        where.OR = [
          { status: INSTALL_JOB_STATUS.QUEUED },
          { assignedWorkerId: worker.id },
        ];
      }
    } else if (workerId) {
      // Admin filtering by worker
      where.assignedWorkerId = workerId;
    }

    const jobs = await prisma.installJob.findMany({
      where,
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
          select: {
            id: true,
            type: true,
            fileUrl: true,
            uploadedAt: true,
          },
        },
        _count: {
          select: {
            proofs: true,
          },
        },
      },
      orderBy: [
        { priority: "desc" },
        { createdAt: "asc" },
      ],
    });

    return NextResponse.json(jobs);
  } catch (error: any) {
    console.error("[JOBS_GET]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
