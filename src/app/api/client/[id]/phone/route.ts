import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { verifyClientAccess } from "@/lib/organization-helpers";

/**
 * GET /api/client/[id]/phone
 * Get all phone numbers for a client
 */
export async function GET(
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

    const { id: clientId } = context.params;

    // Verify user has access to this client
    const access = await verifyClientAccess(session.user.id, clientId);
    if (!access.hasAccess) {
      return NextResponse.json(
        { error: "Unauthorized: You don't have access to this client" },
        { status: 403 }
      );
    }

    // Get all phone numbers for this client
    const phoneNumbers = await prisma.phoneNumber.findMany({
      where: { clientId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(phoneNumbers);
  } catch (error) {
    console.error("Error fetching phone numbers:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/client/[id]/phone
 * Add a phone number to a client (initiates verification)
 */
export async function POST(
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

    const { id: clientId } = context.params;
    const body = await req.json();
    const { phone } = body;

    if (!phone) {
      return NextResponse.json(
        { error: "Missing required field: phone" },
        { status: 400 }
      );
    }

    // Verify user has access to this client
    const access = await verifyClientAccess(session.user.id, clientId);
    if (!access.hasAccess) {
      return NextResponse.json(
        { error: "Unauthorized: You don't have access to this client" },
        { status: 403 }
      );
    }

    // Check if phone number already exists for this client
    const existingPhone = await prisma.phoneNumber.findFirst({
      where: {
        clientId,
        phone,
      },
    });

    if (existingPhone) {
      return NextResponse.json(
        { error: "This phone number is already added to this client" },
        { status: 409 }
      );
    }

    // Create phone number record (unverified by default)
    const phoneNumber = await prisma.phoneNumber.create({
      data: {
        clientId,
        phone,
        verified: false,
      },
    });

    return NextResponse.json({
      success: true,
      phoneNumber,
      message: "Phone number added. Please verify it using the verification flow.",
    });
  } catch (error) {
    console.error("Error adding phone number:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

