import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { INSTALL_JOB_STATUS, ACCESS_METHOD } from "@/lib/job-status";

/**
 * POST /api/onboarding
 * Submit onboarding form and create install job (Phase 2)
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
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

    if (!websiteUrls || !Array.isArray(websiteUrls) || websiteUrls.length === 0) {
      return NextResponse.json(
        { error: "At least one website URL is required" },
        { status: 400 }
      );
    }

    if (!platform) {
      return NextResponse.json(
        { error: "Platform is required" },
        { status: 400 }
      );
    }

    if (!installType || !["script", "iframe"].includes(installType)) {
      return NextResponse.json(
        { error: "Valid install type is required (script or iframe)" },
        { status: 400 }
      );
    }

    if (!accessMethod) {
      return NextResponse.json(
        { error: "Access method is required" },
        { status: 400 }
      );
    }

    if (accessMethod === ACCESS_METHOD.TEMPORARY_LOGIN) {
      if (
        !accessCredentials?.adminUrl ||
        !accessCredentials?.username ||
        !accessCredentials?.password ||
        !accessCredentials?.expiry
      ) {
        return NextResponse.json(
          { error: "All temporary login fields are required" },
          { status: 400 }
        );
      }
    } else if (accessMethod === ACCESS_METHOD.ADMIN_INVITE) {
      if (!accessCredentials?.email) {
        return NextResponse.json(
          { error: "Invite email is required" },
          { status: 400 }
        );
      }
    } else if (accessMethod === ACCESS_METHOD.INSTRUCTIONS_ONLY) {
      if (!accessCredentials?.steps || accessCredentials.steps.trim().length === 0) {
        return NextResponse.json(
          { error: "Instructions are required" },
          { status: 400 }
        );
      }
    }

    let customer = await prisma.customer.findUnique({
      where: { userId: session.user.id },
    });

    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          userId: session.user.id,
          smsConsentConfirmedAt: new Date(),
          onboardingCompletedAt: new Date(),
        },
      });
    } else {
      customer = await prisma.customer.update({
        where: { id: customer.id },
        data: {
          smsConsentConfirmedAt: new Date(),
          onboardingCompletedAt: new Date(),
        },
      });
    }

    const encryptedCredentials = JSON.stringify(accessCredentials);

    const installJob = await prisma.installJob.create({
      data: {
        customerId: customer.id,
        platform,
        installType,
        websiteUrls: websiteUrls.filter((url: string) => url.trim() !== ""),
        preferredPlacement: preferredPlacement || null,
        accessMethod,
        accessCredentials: encryptedCredentials,
        notes: notes || null,
        status: INSTALL_JOB_STATUS.QUEUED,
        priority: 0,
        checklistCompleted: false,
        proofUploaded: false,
      },
    });

    return NextResponse.json({
      success: true,
      jobId: installJob.id,
      message: "Onboarding completed and install job created",
    });
  } catch (error: unknown) {
    console.error("[ONBOARDING_POST]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/onboarding
 * Returns full onboarding details from Onboarding table (plan, add-on, setup) for dashboard
 */
export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const onboarding = await prisma.onboarding.findUnique({
      where: { userId: session.user.id },
    });

    if (!onboarding) {
      return NextResponse.json({ onboarding: null });
    }

    return NextResponse.json({
      onboarding: {
        planId: onboarding.planId,
        installAddonSku: onboarding.installAddonSku,
        installAddonStatus: onboarding.installAddonStatus,
        websiteUrls: onboarding.websiteUrls,
        platform: onboarding.platform,
        installType: onboarding.installType,
        preferredPlacement: onboarding.preferredPlacement,
        accessMethod: onboarding.accessMethod,
        notes: onboarding.notes,
        completedAt: onboarding.completedAt,
      },
    });
  } catch (error) {
    console.error("Onboarding GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
