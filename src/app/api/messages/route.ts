import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

/* ---------- GET /api/messages?userId=...&page=1&limit=10  ---------- */

export async function GET(req: NextRequest) {
  try {
    // 1️⃣ Get the session
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    // 2️⃣ Confirm userId in query matches session
    const userIdParam = req.nextUrl.searchParams.get("userId");
    if (!userIdParam || userIdParam !== session.user.id) {
      return new NextResponse("Unauthorized or missing user ID", { status: 403 });
    }

    // 3️⃣ Parse pagination
    const page = parseInt(req.nextUrl.searchParams.get("page") || "1", 10);
    const limit = parseInt(req.nextUrl.searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;

    // 4️⃣ Optional search
    const q = req.nextUrl.searchParams.get("q") || "";

    // 5️⃣ Fetch messages
    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where: {
          client: {
            userId: session.user.id,
            OR: q
              ? [
                  { name: { contains: q, mode: "insensitive" } },
                  { domain: { contains: q, mode: "insensitive" } },
                ]
              : undefined,
          },
        },
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
        where: { client: { userId: session.user.id } },
      }),
    ]);

    // 6️⃣ Return paginated JSON
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
