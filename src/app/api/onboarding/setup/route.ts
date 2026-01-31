import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { INSTALL_JOB_STATUS } from "@/lib/job-status";

/**
 * PATCH /api/onboarding/setup
 * Submit install setup (website URLs, platform, access, etc.) → create Customer + InstallJob.
 * Install Job is only created if the customer has already given SMS consent (Customer.smsConsentConfirmedAt).
 * Does NOT write to Onboarding table; install-setup data lives in InstallJob only.
 */
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

    // Access credentials optional here (Settings form may not send them). Onboarding page validates fully.

    let customer = await prisma.customer.findUnique({
      where: { userId: session.user.id },
    });

    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          userId: session.user.id,
        },
      });
    }

    // SMS consent is a hard gate before creating an Install Job (per requirements).
    if (!customer.smsConsentConfirmedAt) {
      return NextResponse.json(
        { error: "SMS consent required before creating install jobs. Complete onboarding first.", consentRequired: true },
        { status: 400 }
      );
    }

    const encryptedCredentials = JSON.stringify(accessCredentials || {});

    await prisma.installJob.create({
      data: {
        customerId: customer.id,
        platform,
        installType,
        websiteUrls: websiteUrls.filter((url: string) => typeof url === "string" && url.trim()),
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

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Onboarding setup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
