import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizeReferralCode } from "@/lib/referral";

export async function GET(req: NextRequest) {
  try {
    const code = normalizeReferralCode(req.nextUrl.searchParams.get("code"));

    if (!code) {
      return NextResponse.json({ valid: false });
    }

    const referralCode = await prisma.referralCode.findUnique({
      where: { code },
      select: { code: true, isActive: true },
    });

    return NextResponse.json({
      valid: !!referralCode?.isActive,
      code: referralCode?.isActive ? referralCode.code : null,
    });
  } catch (error) {
    console.error("[REFERRAL_VALIDATE]", error);
    return NextResponse.json({ valid: false }, { status: 500 });
  }
}
