import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/admin/install-requests
 * Returns all onboarding records that have a widget install add-on (installAddonSku is set).
 * Admin only.
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = req.nextUrl;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const status = searchParams.get("status") || ""; // "paid" | "pending" | "" (all)
    const skip = (page - 1) * limit;

    const where: Prisma.OnboardingWhereInput = {
      installAddonSku: { not: null },
    };
    if (status === "paid") {
      where.installAddonStatus = "paid";
    } else if (status === "pending") {
      where.OR = [
        { installAddonStatus: null },
        { installAddonStatus: { not: "paid" } },
      ];
    }

    const [records, total] = await Promise.all([
      prisma.onboarding.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      prisma.onboarding.count({ where }),
    ]);

    return NextResponse.json({
      data: records,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Admin install-requests error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
