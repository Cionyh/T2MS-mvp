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
    } = body;

    const urls = Array.isArray(websiteUrls)
      ? websiteUrls.filter((u) => typeof u === "string" && u.trim())
      : [];

    await prisma.onboarding.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        planId: "free",
        websiteUrls: urls,
        platform: platform ?? null,
        installType: installType ?? null,
        preferredPlacement: preferredPlacement ?? null,
        accessMethod: accessMethod ?? null,
        accessCredentials: accessCredentials ?? null,
        notes: notes ?? null,
      },
      update: {
        websiteUrls: urls,
        platform: platform ?? null,
        installType: installType ?? null,
        preferredPlacement: preferredPlacement ?? null,
        accessMethod: accessMethod ?? null,
        accessCredentials: accessCredentials ?? null,
        notes: notes ?? null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Onboarding setup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
