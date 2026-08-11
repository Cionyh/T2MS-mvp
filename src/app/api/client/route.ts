import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { checkSiteLimit } from "@/lib/plan-limits";
import { getActiveOrganization, isPhoneUsedByAnotherUser, normalizeKeyword, isKeywordTakenByUser } from "@/lib/organization-helpers";
import { INSTALL_JOB_STATUS } from "@/lib/job-status";
import { isHostedOnlyPath } from "@/lib/setup-path";

/* ----------  POST /api/client  ----------------------------------------- */
export async function POST(req: Request) {
  let normalizedDomain: string | undefined;
  let domain: string | undefined;
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
    const { name, domain: domainValue, phone: phoneValue, keyword: keywordValue } = body;
    domain = typeof domainValue === "string" ? domainValue.trim() : "";

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { error: "Missing required field: name" },
        { status: 400 }
      );
    }

    // Get active organization first (needed for plan check and creation)
    const organizationId = await getActiveOrganization();
    if (!organizationId) {
      return NextResponse.json(
        { error: "No active organization. Please select or create an organization first." },
        { status: 400 }
      );
    }

    // Check site limit based on organization's plan
    // Re-check right before create to reduce double-submit races during onboarding
    const siteLimit = await checkSiteLimit(organizationId);
    if (!siteLimit.allowed) {
      // Prefer resuming the existing site rather than failing opaquely during onboarding
      const existing = await prisma.client.findFirst({
        where: { organizationId },
        orderBy: { createdAt: "asc" },
        select: { id: true, name: true, domain: true },
      });
      return NextResponse.json(
        {
          error: `Site limit exceeded. You can create up to ${siteLimit.limit === -1 ? "unlimited" : siteLimit.limit} sites on your current plan. You currently have ${siteLimit.current} sites.`,
          limitExceeded: true,
          current: siteLimit.current,
          limit: siteLimit.limit,
          existingClientId: existing?.id ?? null,
          existingClient: existing,
        },
        { status: 403 }
      );
    }

    // Keyword is optional for all plans. When provided, validate format and uniqueness.
    const rawKeyword = typeof keywordValue === "string" ? keywordValue.trim() : "";
    let keyword: string | null = null;
    if (rawKeyword) {
      if (!/^[A-Za-z0-9_]{1,50}$/.test(rawKeyword)) {
        return NextResponse.json(
          { error: "Keyword must be 1–50 characters, letters, numbers, or underscore only." },
          { status: 400 }
        );
      }
      const normalized = normalizeKeyword(rawKeyword);
      const taken = await isKeywordTakenByUser(session.user.id, normalized);
      if (taken) {
        return NextResponse.json(
          { error: `You already have a site with keyword "${normalized}". Choose a different keyword.` },
          { status: 409 }
        );
      }
      keyword = normalized;
    }

    // Domain is optional (hosted-only / no website yet). Generate a unique placeholder if omitted.
    if (domain) {
      try {
        const url = new URL(
          domain.startsWith("http://") || domain.startsWith("https://")
            ? domain
            : `https://${domain}`
        );
        normalizedDomain = url.hostname.replace(/^www\./, "");
      } catch (err) {
        console.error("[DOMAIN_NORMALIZATION_ERROR]", err);
        return NextResponse.json(
          { error: "Invalid domain format" },
          { status: 400 }
        );
      }

      if (!normalizedDomain) {
        return NextResponse.json(
          { error: "Invalid domain format" },
          { status: 400 }
        );
      }

      // Validate domain not already registered (don't create site if taken)
      const existingByDomain = await prisma.client.findUnique({
        where: { domain: normalizedDomain },
      });
      if (existingByDomain) {
        return NextResponse.json(
          { error: `The domain "${normalizedDomain}" is already registered.` },
          { status: 409 }
        );
      }
    } else {
      normalizedDomain = `pending-${session.user.id.slice(0, 12)}-${Date.now()}.t2ms.local`;
    }

    // If phone provided (e.g. onboarding), validate it's not used by another user before creating site
    if (phoneValue && typeof phoneValue === "string" && phoneValue.trim()) {
      const usedByOther = await isPhoneUsedByAnotherUser(session.user.id, phoneValue.trim());
      if (usedByOther) {
        return NextResponse.json(
          {
            error:
              "This phone number is already used by another account. Each phone number can only be linked to one account.",
          },
          { status: 409 }
        );
      }
    }

    const onboarding = await prisma.onboarding.findUnique({
      where: { userId: session.user.id },
      select: { setupPath: true },
    });
    const skipInstallJob = isHostedOnlyPath(onboarding?.setupPath);
    const hasRealDomain = !normalizedDomain.endsWith(".t2ms.local");
    const mainWebsiteUrl = hasRealDomain ? `https://${normalizedDomain}` : null;

    const client = await prisma.client.create({
      data: {
        name: name.trim(),
        domain: normalizedDomain,
        organizationId,
        keyword,
        widgetConfig: mainWebsiteUrl
          ? { companyWebsiteLink: mainWebsiteUrl }
          : {},
        defaultType: "banner",
        defaultBgColor: "#222",
        defaultTextColor: "#fff",
        defaultFont: "sans-serif",
        defaultDismissAfter: 0,
        pinned: false,
      },
    });

    if (skipInstallJob) {
      return NextResponse.json({
        id: client.id,
        defaultType: client.defaultType,
        defaultBgColor: client.defaultBgColor,
        defaultTextColor: client.defaultTextColor,
        defaultFont: client.defaultFont,
        defaultDismissAfter: client.defaultDismissAfter,
        pinned: client.pinned,
      });
    }

    // Auto-create an install job (embed path) so site shows "Installation In Progress"
    // Only when a real website domain was provided
    if (!hasRealDomain) {
      return NextResponse.json({
        id: client.id,
        defaultType: client.defaultType,
        defaultBgColor: client.defaultBgColor,
        defaultTextColor: client.defaultTextColor,
        defaultFont: client.defaultFont,
        defaultDismissAfter: client.defaultDismissAfter,
        pinned: client.pinned,
      });
    }

    try {
      let customer = await prisma.customer.findUnique({
        where: { userId: session.user.id },
      });
      if (!customer) {
        customer = await prisma.customer.create({
          data: { userId: session.user.id },
        });
      }
      await prisma.installJob.create({
        data: {
          customerId: customer.id,
          clientId: client.id,
          platform: "To be confirmed",
          installType: "script",
          websiteUrls: [client.domain.startsWith("http") ? client.domain : `https://${client.domain}`],
          accessMethod: "instructions",
          accessCredentials: "{}",
          status: INSTALL_JOB_STATUS.QUEUED,
          priority: 0,
          checklistCompleted: false,
          proofUploaded: false,
        },
      });
    } catch (jobErr) {
      console.error("[CLIENT_POST] Auto-create install job failed:", jobErr);
      // Don't fail client creation if job creation fails
    }

    // Return all defaults along with id
    return NextResponse.json({
      id: client.id,
      defaultType: client.defaultType,
      defaultBgColor: client.defaultBgColor,
      defaultTextColor: client.defaultTextColor,
      defaultFont: client.defaultFont,
      defaultDismissAfter: client.defaultDismissAfter,
      pinned: client.pinned,
    });
  } catch (error) {
    if (error instanceof Error && (error as any).code === "P2002") {
      const target = (error as any).meta?.target;
      if (target === "Client_domain_key" || target.includes("domain")) {
        // Use normalizedDomain if available, otherwise use original domain
        const errorDomain = normalizedDomain || domain || "unknown";
        return NextResponse.json(
          { error: `The domain "${errorDomain}" is already registered.` },
          { status: 409 } // Conflict
        );
      }
    }

    console.error("[CLIENT_POST]", error);
    return NextResponse.json(
      { error: "Client creation failed. Please try again." },
      { status: 500 }
    );
  }
}

/* ----------  GET /api/client - Get clients for active organization  ------------------------------- */
export async function GET(req: NextRequest) {
  try {
    /* 1️⃣ Retrieve the Better Auth session */
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    /* 2️⃣ Get active organization */
    const organizationId = await getActiveOrganization();
    if (!organizationId) {
      // Return empty array if no active organization
      return NextResponse.json([]);
    }

    /* 3️⃣ Fetch clients; include install job status if DB has clientId column (install_job) */
    let clients: Array<Record<string, unknown>>;
    try {
      const result = await prisma.client.findMany({
        where: { organizationId },
        include: {
          phoneNumbers: {
            where: { verified: true },
            select: {
              id: true,
              phone: true,
              verified: true,
            },
          },
          installJobs: {
            orderBy: { createdAt: "desc" },
            take: 1,
            select: { id: true, status: true, platform: true },
          },
        },
      });
      clients = result.map((client) => {
        const { installJobs, ...rest } = client;
        return {
          ...rest,
          installJob: installJobs?.[0] ?? null,
        };
      });
    } catch (includeError: unknown) {
      const code = (includeError as { code?: string })?.code;
      if (code === "P2022" || (includeError instanceof Error && includeError.message?.includes("clientId"))) {
        const result = await prisma.client.findMany({
          where: { organizationId },
          include: {
            phoneNumbers: {
              where: { verified: true },
              select: { id: true, phone: true, verified: true },
            },
          },
        });
        clients = result.map((client) => ({ ...client, installJob: null }));
      } else {
        throw includeError;
      }
    }

    return NextResponse.json(clients);
  } catch (error) {
    console.error("[CLIENTS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}