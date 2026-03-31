import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { normalizeReferralCode } from "@/lib/referral";

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const codes = await prisma.referralCode.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { users: true },
        },
      },
    });

    return NextResponse.json({ codes });
  } catch (error) {
    console.error("[ADMIN_REFERRAL_CODES_GET]", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const code = normalizeReferralCode(body.code);
    const type = typeof body.type === "string" ? body.type.trim().toLowerCase() : "";
    const label = typeof body.label === "string" ? body.label.trim() : "";

    if (!code) {
      return NextResponse.json({ error: "Valid referral code is required" }, { status: 400 });
    }

    if (!type) {
      return NextResponse.json({ error: "Referral type is required" }, { status: 400 });
    }

    const created = await prisma.referralCode.create({
      data: {
        code,
        type,
        label: label || null,
      },
    });

    return NextResponse.json({ code: created });
  } catch (error: any) {
    console.error("[ADMIN_REFERRAL_CODES_POST]", error);
    if (error?.code === "P2002") {
      return NextResponse.json({ error: "Referral code already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
