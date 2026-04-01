import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { normalizeCouponCode } from "@/lib/coupons";

interface Params {
  id: string;
}

function parsePlan(plan: unknown) {
  return plan === "starter" || plan === "pro" ? plan : null;
}

export async function PATCH(req: NextRequest, { params }: { params: Params }) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const code = body.code !== undefined ? normalizeCouponCode(body.code) : undefined;
    const plan = body.plan !== undefined ? parsePlan(body.plan) : undefined;
    const durationInMonths =
      body.durationInMonths !== undefined ? Number(body.durationInMonths) : undefined;
    const usageLimit = body.usageLimit !== undefined ? Number(body.usageLimit) : undefined;
    const notes = body.notes !== undefined ? String(body.notes || "").trim() : undefined;
    const isActive = body.isActive !== undefined ? Boolean(body.isActive) : undefined;
    const expiresAt =
      body.expiresAt !== undefined
        ? body.expiresAt
          ? new Date(body.expiresAt)
          : null
        : undefined;

    if (body.code !== undefined && !code) {
      return NextResponse.json({ error: "Valid coupon code is required" }, { status: 400 });
    }
    if (body.plan !== undefined && !plan) {
      return NextResponse.json({ error: "Valid plan is required" }, { status: 400 });
    }
    if (
      durationInMonths !== undefined &&
      (!Number.isInteger(durationInMonths) || durationInMonths < 1)
    ) {
      return NextResponse.json({ error: "Duration must be at least 1 month" }, { status: 400 });
    }
    if (usageLimit !== undefined && (!Number.isInteger(usageLimit) || usageLimit < 1)) {
      return NextResponse.json({ error: "Usage limit must be at least 1" }, { status: 400 });
    }
    if (expiresAt !== undefined && expiresAt && Number.isNaN(expiresAt.getTime())) {
      return NextResponse.json({ error: "Invalid expiry date" }, { status: 400 });
    }

    const coupon = await prisma.couponCode.update({
      where: { id: params.id },
      data: {
        ...(code ? { code } : {}),
        ...(plan ? { plan } : {}),
        ...(durationInMonths !== undefined ? { durationInMonths } : {}),
        ...(usageLimit !== undefined ? { usageLimit } : {}),
        ...(notes !== undefined ? { notes: notes || null } : {}),
        ...(isActive !== undefined ? { isActive } : {}),
        ...(expiresAt !== undefined ? { expiresAt } : {}),
      },
    });

    return NextResponse.json({ coupon });
  } catch (error: any) {
    console.error("[ADMIN_COUPON_CODES_PATCH]", error);
    if (error?.code === "P2002") {
      return NextResponse.json({ error: "Coupon code already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Params }) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.couponCode.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[ADMIN_COUPON_CODES_DELETE]", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
