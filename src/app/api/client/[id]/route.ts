/* eslint-disable */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { verifyClientAccess, normalizeKeyword, isKeywordTakenByUser } from "@/lib/organization-helpers";
import {
  isPlaceholderDomain,
  normalizeClientDomain,
  siteReadyForWidget,
} from "@/lib/client-setup";
import { INSTALL_JOB_STATUS } from "@/lib/job-status";

/**
 * When a user skipped domain at onboarding then adds a real website later,
 * create a placeholder QUEUED install job if none is already open for this site.
 */
async function ensureInstallJobAfterDomainAdded(params: {
  userId: string;
  clientId: string;
  domain: string;
  hadPlaceholderDomain: boolean;
  domainJustUpdated: boolean;
}) {
  const { userId, clientId, domain, hadPlaceholderDomain, domainJustUpdated } =
    params;

  // Only auto-create when they first provide a real domain (onboarding skip → dashboard fill-in)
  if (!domainJustUpdated || !hadPlaceholderDomain) return;
  if (isPlaceholderDomain(domain)) return;

  const openJob = await prisma.installJob.findFirst({
    where: {
      clientId,
      status: {
        notIn: [
          INSTALL_JOB_STATUS.COMPLETED,
          INSTALL_JOB_STATUS.CANCELLED,
        ],
      },
    },
    select: { id: true },
  });
  if (openJob) return;

  let customer = await prisma.customer.findUnique({
    where: { userId },
  });
  if (!customer) {
    customer = await prisma.customer.create({
      data: { userId },
    });
  }

  const websiteUrl = domain.startsWith("http") ? domain : `https://${domain}`;

  await prisma.installJob.create({
    data: {
      customerId: customer.id,
      clientId,
      platform: "To be confirmed",
      installType: "script",
      websiteUrls: [websiteUrl],
      accessMethod: "instructions",
      accessCredentials: "{}",
      status: INSTALL_JOB_STATUS.QUEUED,
      priority: 0,
      checklistCompleted: false,
      proofUploaded: false,
    },
  });
}

export async function PUT(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = context.params;

    if (!id) {
      return NextResponse.json({ error: "Missing client ID" }, { status: 400 });
    }

    // Verify user has access to this client via organization
    const access = await verifyClientAccess(session.user.id, id);
    if (!access.hasAccess) {
      return NextResponse.json(
        { error: "Unauthorized: You don't have access to this client" },
        { status: 403 }
      );
    }

    const body = await req.json();

    // Include pinned, widgetConfig, keyword (phone removed - handled separately)
    const {
      name,
      domain,
      defaultType,
      defaultBgColor,
      defaultTextColor,
      defaultFont,
      defaultDismissAfter,
      pinned,
      widgetConfig,
      keyword: keywordValue,
    } = body;

    const existing = await prisma.client.findUnique({
      where: { id },
      select: { domain: true, keyword: true },
    });
    if (!existing) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    const hadPlaceholderDomain = isPlaceholderDomain(existing.domain);

    const updateData: Record<string, unknown> = {
      ...(name && { name }),
      ...(defaultType && { defaultType }),
      ...(defaultBgColor && { defaultBgColor }),
      ...(defaultTextColor && { defaultTextColor }),
      ...(defaultFont && { defaultFont }),
      ...(defaultDismissAfter !== undefined && { defaultDismissAfter }),
      ...(widgetConfig !== undefined && { widgetConfig }),
    };

    let domainJustUpdated = false;

    if (domain !== undefined && domain !== null && String(domain).trim()) {
      let normalizedDomain: string;
      try {
        normalizedDomain = normalizeClientDomain(String(domain));
      } catch {
        return NextResponse.json({ error: "Invalid domain format" }, { status: 400 });
      }
      if (isPlaceholderDomain(normalizedDomain)) {
        return NextResponse.json(
          { error: "Please enter a real website domain." },
          { status: 400 }
        );
      }
      const taken = await prisma.client.findFirst({
        where: { domain: normalizedDomain, NOT: { id } },
        select: { id: true },
      });
      if (taken) {
        return NextResponse.json(
          { error: `The domain "${normalizedDomain}" is already registered.` },
          { status: 409 }
        );
      }
      updateData.domain = normalizedDomain;
      domainJustUpdated = normalizedDomain !== existing.domain;
    }

    if (keywordValue !== undefined) {
      const rawKeyword = typeof keywordValue === "string" ? keywordValue.trim() : "";
      if (!rawKeyword) {
        return NextResponse.json(
          { error: "Keyword cannot be empty. Use 1–50 letters, numbers, or underscore." },
          { status: 400 }
        );
      }
      if (!/^[A-Za-z0-9_]{1,50}$/.test(rawKeyword)) {
        return NextResponse.json(
          { error: "Keyword must be 1–50 characters, letters, numbers, or underscore only." },
          { status: 400 }
        );
      }
      const keyword = normalizeKeyword(rawKeyword);
      const taken = await isKeywordTakenByUser(session.user.id, keyword, id);
      if (taken) {
        return NextResponse.json(
          { error: `You already have a site with keyword "${keyword}". Choose a different keyword.` },
          { status: 409 }
        );
      }
      updateData.keyword = keyword;
    }

    const nextDomain =
      typeof updateData.domain === "string" ? updateData.domain : existing.domain;
    const nextKeyword =
      typeof updateData.keyword === "string" ? updateData.keyword : existing.keyword;

    if (pinned === true && !siteReadyForWidget({ domain: nextDomain, keyword: nextKeyword })) {
      return NextResponse.json(
        {
          error:
            "Add your website domain and SMS keyword before enabling the widget.",
          needsWidgetSetup: true,
        },
        { status: 400 }
      );
    }

    if (pinned !== undefined) {
      updateData.pinned = pinned;
    }

    // Keep company website link in sync when domain is set for the first time
    if (domainJustUpdated && !isPlaceholderDomain(nextDomain)) {
      const existingConfig =
        (await prisma.client.findUnique({
          where: { id },
          select: { widgetConfig: true },
        }))?.widgetConfig;
      const configObj =
        existingConfig && typeof existingConfig === "object" && !Array.isArray(existingConfig)
          ? { ...(existingConfig as Record<string, unknown>) }
          : {};
      if (widgetConfig && typeof widgetConfig === "object") {
        Object.assign(configObj, widgetConfig as Record<string, unknown>);
      }
      if (!configObj.companyWebsiteLink) {
        configObj.companyWebsiteLink = `https://${nextDomain}`;
      }
      updateData.widgetConfig = configObj;
    }

    const updatedClient = await prisma.client.update({
      where: { id },
      data: updateData as Parameters<typeof prisma.client.update>[0]["data"],
    });

    // Deferred domain from optional onboarding → create install job for the queue
    try {
      await ensureInstallJobAfterDomainAdded({
        userId: session.user.id,
        clientId: id,
        domain: nextDomain,
        hadPlaceholderDomain,
        domainJustUpdated,
      });
    } catch (jobErr) {
      console.error("[CLIENT_PUT] Auto-create install job failed:", jobErr);
      // Don't fail the domain/keyword save if job creation fails
    }

    return NextResponse.json({
      message: `Successfully updated client ${id}`,
      data: updatedClient,
    });
  } catch (error) {
    console.error("PUT error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = context.params;

    if (!id) {
      return NextResponse.json({ error: "Missing client ID" }, { status: 400 });
    }

    // Verify user has access to this client via organization
    const access = await verifyClientAccess(session.user.id, id);
    if (!access.hasAccess) {
      return NextResponse.json(
        { error: "Unauthorized: You don't have access to this client" },
        { status: 403 }
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.installJob.deleteMany({ where: { clientId: id } });
      await tx.client.delete({ where: { id } });
    });

    return NextResponse.json({
      message: `Successfully deleted client ${id}`,
    });
  } catch (error) {
    console.error("DELETE error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
