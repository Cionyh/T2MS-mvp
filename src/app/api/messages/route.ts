import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { Prisma } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const userIdParam = req.nextUrl.searchParams.get("userId");
    if (!userIdParam || userIdParam !== session.user.id) {
      return new NextResponse("Unauthorized or missing user ID", { status: 403 });
    }

    const page = parseInt(req.nextUrl.searchParams.get("page") || "1", 10);
    const limit = parseInt(req.nextUrl.searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;
    const q = req.nextUrl.searchParams.get("q") || "";

    const where: Prisma.MessageWhereInput = {
      client: { userId: session.user.id },
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
              user: { select: { id: true, name: true, email: true } },
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