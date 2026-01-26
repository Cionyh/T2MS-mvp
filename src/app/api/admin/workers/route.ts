import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { WORKER_AVAILABILITY } from "@/lib/job-status";

/**
 * GET /api/admin/workers
 * List all workers (admin only)
 */
export async function GET(req: NextRequest) {
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

    const { searchParams } = req.nextUrl;
    const availability = searchParams.get("availability");
    const search = searchParams.get("search");

    const where: any = {};

    if (availability) {
      where.availability = availability;
    }

    if (search) {
      where.user = {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
        ],
      };
    }

    const workers = await prisma.worker.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            assignedJobs: true,
            payouts: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Get active job counts for each worker
    const workersWithStats = await Promise.all(
      workers.map(async (worker) => {
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

        return {
          ...worker,
          activeJobCount,
          completedJobCount,
          totalEarnings: totalEarnings._sum.amount || 0,
        };
      })
    );

    return NextResponse.json(workersWithStats);
  } catch (error: any) {
    console.error("[ADMIN_WORKERS_GET]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/workers
 * Create a new worker (admin only)
 */
export async function POST(req: NextRequest) {
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
    const { userId, email, name, password, availability, maxActiveJobs } = body;

    let targetUserId: string;

    // If userId is provided, use existing user
    if (userId) {
      // Check if user exists
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return NextResponse.json(
          { error: "User not found" },
          { status: 404 }
        );
      }

      // Check if worker already exists for this user
      const existingWorker = await prisma.worker.findUnique({
        where: { userId },
      });

      if (existingWorker) {
        return NextResponse.json(
          { error: "Worker already exists for this user" },
          { status: 400 }
        );
      }

      targetUserId = userId;
    } else {
      // Create new user + worker
      if (!email || !name || !password) {
        return NextResponse.json(
          { error: "email, name, and password are required when creating a new user" },
          { status: 400 }
        );
      }

      // Check if user with this email already exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: "User with this email already exists. Please use 'Convert Existing User' option instead." },
          { status: 400 }
        );
      }

      // Import auth to create user with proper password hashing
      const { auth } = await import("@/lib/auth");

      // Create new user using better-auth
      const signUpResult = await auth.api.signUpEmail({
        body: {
          email,
          password,
          name,
        },
      });

      if (!signUpResult || !signUpResult.user) {
        return NextResponse.json(
          { error: "Failed to create user account" },
          { status: 500 }
        );
      }

      targetUserId = signUpResult.user.id;
    }

    // Create worker
    const worker = await prisma.worker.create({
      data: {
        userId: targetUserId,
        availability: availability || WORKER_AVAILABILITY.OFF_SHIFT,
        maxActiveJobs: maxActiveJobs || 2,
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
      worker,
      message: userId ? "Worker created successfully" : "Worker account created successfully",
    });
  } catch (error: any) {
    console.error("[ADMIN_WORKERS_POST]", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
