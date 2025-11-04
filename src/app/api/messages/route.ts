import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { Prisma } from "@prisma/client";
import { getActiveOrganization } from "@/lib/organization-helpers";

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    // Get active organization
    const organizationId = await getActiveOrganization();
    if (!organizationId) {
      return NextResponse.json({
        data: [],
        pagination: {
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 0,
        },
      });
    }

    const page = parseInt(req.nextUrl.searchParams.get("page") || "1", 10);
    const limit = parseInt(req.nextUrl.searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;
    const q = req.nextUrl.searchParams.get("q") || "";

    const where: Prisma.MessageWhereInput = {
      client: { organizationId },
      ...(q
        ? {
            OR: [
              { content: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    // Use the *same* 'where' clause for both queries
    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where, // This includes the search filter
        include: {
          client: {
            select: {
              id: true,
              name: true,
              domain: true,
              organizationId: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.message.count({
        where, // <-- CORRECTED: Use the same filter for the count
      }),
    ]);

    return NextResponse.json({
      data: messages,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("[MESSAGES_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}