import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { INSTALL_JOB_STATUS, ACCESS_METHOD } from "@/lib/job-status";

/**
 * POST /api/onboarding
 * Submit onboarding form and create install job
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate user
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // 2. Parse request body
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

    // 3. Validate required fields
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

    // 4. Validate access credentials based on access method
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

    // 5. Get or create customer record
    let customer = await prisma.customer.findUnique({
      where: { userId: session.user.id },
    });

    if (!customer) {
      // Create customer record
      customer = await prisma.customer.create({
        data: {
          userId: session.user.id,
          smsConsentConfirmedAt: new Date(), // Set when onboarding is submitted
          onboardingCompletedAt: new Date(),
        },
      });
    } else {
      // Update existing customer record
      customer = await prisma.customer.update({
        where: { id: customer.id },
        data: {
          smsConsentConfirmedAt: new Date(),
          onboardingCompletedAt: new Date(),
        },
      });
    }

    // 6. Encrypt access credentials (for now, store as JSON string - TODO: implement KMS encryption)
    const encryptedCredentials = JSON.stringify(accessCredentials);

    // 7. Create install job
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
  } catch (error: any) {
    console.error("[ONBOARDING_POST]", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/onboarding
 * Get onboarding status for current user
 */
export async function GET(req: NextRequest) {
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

    const customer = await prisma.customer.findUnique({
      where: { userId: session.user.id },
      include: {
        installJobs: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (!customer) {
      return NextResponse.json({
        onboardingCompleted: false,
        smsConsentConfirmed: false,
      });
    }

    return NextResponse.json({
      onboardingCompleted: !!customer.onboardingCompletedAt,
      smsConsentConfirmed: !!customer.smsConsentConfirmedAt,
      latestJob: customer.installJobs[0] || null,
    });
  } catch (error: any) {
    console.error("[ONBOARDING_GET]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
