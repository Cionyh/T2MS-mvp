import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { formatCouponPlan, normalizeCouponCode } from "@/lib/coupons";

export async function GET(req: NextRequest) {
  try {
    const code = normalizeCouponCode(req.nextUrl.searchParams.get("code"));

    if (!code) {
      return NextResponse.json({ valid: false, error: "Invalid coupon code" }, { status: 400 });
    }

    const coupon = await prisma.couponCode.findUnique({
      where: { code },
      include: {
        _count: {
          select: { redemptions: true },
        },
      },
    });

    if (!coupon || !coupon.isActive) {
      return NextResponse.json({ valid: false, error: "Coupon code not found" }, { status: 404 });
    }

    if (coupon.expiresAt && coupon.expiresAt <= new Date()) {
      return NextResponse.json({ valid: false, error: "Coupon code has expired" }, { status: 400 });
    }

    const usedCount = coupon._count.redemptions;
    if (usedCount >= coupon.usageLimit) {
      return NextResponse.json({ valid: false, error: "Coupon code usage limit reached" }, { status: 400 });
    }

    return NextResponse.json({
      valid: true,
      coupon: {
        code: coupon.code,
        plan: coupon.plan,
        planLabel: formatCouponPlan(coupon.plan),
        durationInMonths: coupon.durationInMonths,
        usageLimit: coupon.usageLimit,
        usedCount,
        remainingUses: coupon.usageLimit - usedCount,
        expiresAt: coupon.expiresAt,
        notes: coupon.notes,
      },
    });
  } catch (error) {
    console.error("[COUPON_VALIDATE]", error);
    return NextResponse.json({ valid: false, error: "Something went wrong" }, { status: 500 });
  }
}
