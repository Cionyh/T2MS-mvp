import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { Prisma } from "@prisma/client";
import { getClientIdsForUser } from "@/lib/organization-helpers";

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const page = parseInt(req.nextUrl.searchParams.get("page") || "1", 10);
    const limit = parseInt(req.nextUrl.searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;
    const q = req.nextUrl.searchParams.get("q") || "";

    // Show messages from all sites the user has access to (not tied to active org — fixes empty list when active org not set)
    const clientIds = await getClientIdsForUser(session.user.id);
    const baseWhere: Prisma.MessageWhereInput =
      clientIds.length > 0 ? { clientId: { in: clientIds } } : { clientId: { in: [] } };
    const where: Prisma.MessageWhereInput = q
      ? { AND: [baseWhere, { OR: [{ content: { contains: q, mode: "insensitive" } }] }] }
      : baseWhere;

    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where,
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