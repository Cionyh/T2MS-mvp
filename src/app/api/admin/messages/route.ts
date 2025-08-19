import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Prisma } from "@prisma/client";

/* ---------- GET /api/admin/messages ---------- */
export async function GET(req: NextRequest) {
  try {
    // 1️⃣ Verify session & admin role
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 2️⃣ Parse query parameters
    const { searchParams } = req.nextUrl;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "10", 10)));
    const q = searchParams.get("q") || "";
    const skip = (page - 1) * limit;

    // 3️⃣ Build type-safe search condition
    const where: Prisma.MessageWhereInput = q
      ? {
          OR: [
            { content: { contains: q, mode: "insensitive" } },
            { client: { name: { contains: q, mode: "insensitive" } } },
            { client: { domain: { contains: q, mode: "insensitive" } } },
            { client: { user: { email: { contains: q, mode: "insensitive" } } } },
          ],
        }
      : {};

    // 4️⃣ Fetch messages + total count
    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
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
      }),
      prisma.message.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    // 5️⃣ Return JSON response
    return NextResponse.json({
      data: messages,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error("[ADMIN_MESSAGES_GET]", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong" },
      { status: 500 }
    );
  }
}
