import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { planId, installAddonSku } = body as {
      planId?: string;
      installAddonSku?: string | null;
    };

    const plan = planId ?? "free";
    const addon = installAddonSku === "standard" || installAddonSku === "restricted" ? installAddonSku : null;

    await prisma.onboarding.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        planId: plan,
        installAddonSku: addon,
      },
      update: {
        planId: plan,
        installAddonSku: addon,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Onboarding plan error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
