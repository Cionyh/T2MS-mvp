import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { normalizeCouponCode } from "@/lib/coupons";

function isAdmin(session: Awaited<ReturnType<typeof auth.api.getSession>>) {
  return !!session?.user?.id && session.user.role === "admin";
}

function parsePlan(plan: unknown) {
  return plan === "starter" || plan === "pro" ? plan : null;
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!isAdmin(session)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const coupons = await prisma.couponCode.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { redemptions: true },
        },
      },
    });

    return NextResponse.json({ coupons });
  } catch (error) {
    console.error("[ADMIN_COUPON_CODES_GET]", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!isAdmin(session)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const code = normalizeCouponCode(body.code);
    const plan = parsePlan(body.plan);
    const durationInMonths = Number(body.durationInMonths);
    const usageLimit = Number(body.usageLimit);
    const notes = typeof body.notes === "string" ? body.notes.trim() : "";
    const expiresAt =
      typeof body.expiresAt === "string" && body.expiresAt
        ? new Date(body.expiresAt)
        : null;

    if (!code) {
      return NextResponse.json({ error: "Valid coupon code is required" }, { status: 400 });
    }
    if (!plan) {
      return NextResponse.json({ error: "Valid plan is required" }, { status: 400 });
    }
    if (!Number.isInteger(durationInMonths) || durationInMonths < 1) {
      return NextResponse.json({ error: "Duration must be at least 1 month" }, { status: 400 });
    }
    if (!Number.isInteger(usageLimit) || usageLimit < 1) {
      return NextResponse.json({ error: "Usage limit must be at least 1" }, { status: 400 });
    }
    if (expiresAt && Number.isNaN(expiresAt.getTime())) {
      return NextResponse.json({ error: "Invalid expiry date" }, { status: 400 });
    }

    const coupon = await prisma.couponCode.create({
      data: {
        code,
        plan,
        durationInMonths,
        usageLimit,
        expiresAt,
        notes: notes || null,
      },
    });

    return NextResponse.json({ coupon });
  } catch (error: any) {
    console.error("[ADMIN_COUPON_CODES_POST]", error);
    if (error?.code === "P2002") {
      return NextResponse.json({ error: "Coupon code already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
