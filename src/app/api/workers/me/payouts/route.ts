import { NextRequest, NextResponse } from "next/server";
import { verifyWorker } from "@/lib/worker-helpers";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/workers/me/payouts
 * Get payout history for current worker
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

    const { searchParams } = req.nextUrl;
    const status = searchParams.get("status");

    const where: any = {
      workerId: worker.id,
    };

    if (status) {
      where.status = status;
    }

    const payouts = await prisma.workerPayout.findMany({
      where,
      include: {
        job: {
          select: {
            id: true,
            platform: true,
            installType: true,
            websiteUrls: true,
            status: true,
            updatedAt: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Calculate summary
    const summary = await prisma.workerPayout.aggregate({
      where: { workerId: worker.id },
      _sum: {
        amount: true,
      },
      _count: {
        id: true,
      },
    });

    const byStatus = await prisma.workerPayout.groupBy({
      by: ["status"],
      where: { workerId: worker.id },
      _sum: {
        amount: true,
      },
      _count: {
        id: true,
      },
    });

    return NextResponse.json({
      payouts,
      summary: {
        totalAmount: summary._sum.amount ? Number(summary._sum.amount) : 0,
        totalCount: summary._count.id || 0,
        byStatus: byStatus.reduce(
          (acc, item) => {
            acc[item.status] = {
              amount: item._sum.amount ? Number(item._sum.amount) : 0,
              count: item._count.id || 0,
            };
            return acc;
          },
          {} as Record<string, { amount: number; count: number }>
        ),
      },
    });
  } catch (error: any) {
    console.error("[WORKERS_PAYOUTS]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
