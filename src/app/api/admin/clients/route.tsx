import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Prisma } from "@prisma/client";

/* ---------- GET /api/admin/clients ---------- */
export async function GET(req: NextRequest) {
  try {
    // 1️⃣ Retrieve session & verify admin role
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 2️⃣ Parse query parameters
    const { searchParams } = req.nextUrl;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const q = searchParams.get("q") || "";
    const skip = (page - 1) * limit;

    // 3️⃣ Build type-safe search condition
    const where: Prisma.ClientWhereInput = q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { domain: { contains: q, mode: "insensitive" } },
            { phone: { contains: q, mode: "insensitive" } },
            { user: { email: { contains: q, mode: "insensitive" } } },
          ],
        }
      : {};

    // 4️⃣ Fetch clients + total count
    const [clients, total] = await Promise.all([
      prisma.client.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { id: true, name: true, email: true, role: true } },
          _count: { select: { messages: true } },
        },
      }),
      prisma.client.count({ where }),
    ]);

    // 5️⃣ Return JSON response
    return NextResponse.json({
      data: clients,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("[ADMIN_CLIENTS_GET]", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
