import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

/* ----------  POST /api/client  ----------------------------------------- */
export async function POST(req: Request) {
  const body = await req.json();
  const { name, domain, phone, userId } = body;

  if (!userId || !name || !domain || !phone) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  // ✅ Normalize domain: remove protocol, www, and trailing slashes
  let normalizedDomain;
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

  try {
    const client = await prisma.client.create({
      data: {
        name,
        domain: normalizedDomain,
        phone,
        userId,
        // ✅ Defaults for widget
        defaultType: "banner",
        defaultBgColor: "#222",
        defaultTextColor: "#fff",
        defaultFont: "sans-serif",
        defaultDismissAfter: 5000,
        pinned: false,
      },
    });

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
        return NextResponse.json(
          { error: `The domain "${normalizedDomain}" is already registered.` },
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

/* ----------  GET /api/client?userId=...  ------------------------------- */
export async function GET(req: NextRequest) {
  try {
    /* 1️⃣ Retrieve the Better Auth session */
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    /* 2️⃣ Authorise against the query-string userId (optional) */
    const userIdParam = req.nextUrl.searchParams.get("userId");
    if (!userIdParam || userIdParam !== session.user.id) {
      return new NextResponse("Unauthorized or missing user ID", { status: 403 });
    }

    /* 3️⃣ Fetch and return the user’s clients */
    const clients = await prisma.client.findMany({
      where: { userId: session.user.id },
    });

    return NextResponse.json(clients);
  } catch (error) {
    console.error("[CLIENTS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}