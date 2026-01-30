import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      websiteUrls,
      platform,
      installType,
      preferredPlacement,
      accessMethod,
      accessCredentials,
      notes,
      smsConsentConfirmed,
      smsConsentText,
    } = body as {
      websiteUrls?: string[];
      platform?: string;
      installType?: string;
      preferredPlacement?: string;
      accessMethod?: string;
      accessCredentials?: string;
      notes?: string;
      smsConsentConfirmed?: boolean;
      smsConsentText?: string;
    };

    const requiredConsentText =
      "I confirm I have permission to message my contacts using T2MS and understand SMS compliance requirements (TCPA/CTIA).";
    if (!smsConsentConfirmed) {
      return NextResponse.json(
        { error: "SMS consent must be confirmed" },
        { status: 400 }
      );
    }
    if (
      typeof smsConsentText !== "string" ||
      smsConsentText.trim().toLowerCase() !== requiredConsentText.toLowerCase()
    ) {
      return NextResponse.json(
        { error: "SMS consent text must be typed exactly as shown" },
        { status: 400 }
      );
    }

    const urls = Array.isArray(websiteUrls)
      ? websiteUrls.filter((u) => typeof u === "string" && u.trim())
      : [];

    await prisma.onboarding.update({
      where: { userId: session.user.id },
      data: {
        websiteUrls: urls,
        platform: platform ?? null,
        installType: installType ?? null,
        preferredPlacement: preferredPlacement ?? null,
        accessMethod: accessMethod ?? null,
        accessCredentials: accessCredentials ?? null,
        notes: notes ?? null,
        smsConsentConfirmedAt: new Date(),
        completedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Onboarding complete error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
