import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { normalizeReferralCode } from "@/lib/referral";

interface Params {
  id: string;
}

export async function PATCH(req: NextRequest, { params }: { params: Params }) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const code = body.code !== undefined ? normalizeReferralCode(body.code) : undefined;
    const type = body.type !== undefined ? String(body.type).trim().toLowerCase() : undefined;
    const label = body.label !== undefined ? String(body.label).trim() : undefined;
    const isActive = body.isActive !== undefined ? Boolean(body.isActive) : undefined;

    if (body.code !== undefined && !code) {
      return NextResponse.json({ error: "Valid referral code is required" }, { status: 400 });
    }

    const updateData: {
      code?: string;
      type?: string;
      label?: string | null;
      isActive?: boolean;
    } = {};

    if (code) updateData.code = code;
    if (type !== undefined) updateData.type = type;
    if (label !== undefined) updateData.label = label || null;
    if (isActive !== undefined) updateData.isActive = isActive;

    const updated = await prisma.referralCode.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json({ code: updated });
  } catch (error: any) {
    console.error("[ADMIN_REFERRAL_CODES_PATCH]", error);
    if (error?.code === "P2002") {
      return NextResponse.json({ error: "Referral code already exists" }, { status: 409 });
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

    await prisma.referralCode.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[ADMIN_REFERRAL_CODES_DELETE]", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
